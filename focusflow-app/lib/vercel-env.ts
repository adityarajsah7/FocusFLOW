import { neon } from "@neondatabase/serverless";

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing. Connect the Neon database in Vercel Storage.");
  return neon(url);
}

class Statement {
  constructor(private sql: string, private params: unknown[] = []) {}
  bind(...params: unknown[]) { return new Statement(this.sql, params); }
  private async rows() {
    let index = 0;
    const query = this.sql.replace(/\?/g, () => `$${++index}`);
    return await sqlClient().query(query, this.params);
  }
  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const rows = await this.rows();
    return (column ? rows[0]?.[column] : rows[0]) as T ?? null;
  }
  async all() { return { results: await this.rows(), success: true, meta: {} }; }
  async run() { await this.rows(); return { success: true, results: [], meta: {} }; }
  async raw() { return (await this.rows()).map((row) => Object.values(row)); }
}

const DB = { prepare: (query: string) => new Statement(query) };
const BUCKET = {
  async get(key: string) {
    const rows = await sqlClient().query("SELECT content, content_type FROM focusflow_scenes WHERE key = $1", [key]);
    if (!rows.length) return null;
    const bytes = Uint8Array.from(Buffer.from(String(rows[0].content), "base64"));
    const etag = `"${Buffer.from(await crypto.subtle.digest("SHA-256", bytes)).toString("hex")}"`;
    return {
      body: bytes,
      httpEtag: etag,
      writeHttpMetadata(headers: Headers) { headers.set("content-type", String(rows[0].content_type)); },
    };
  },
  async put(key: string, stream: ReadableStream, options: { httpMetadata: { contentType: string } }) {
    const bytes = await new Response(stream).arrayBuffer();
    await sqlClient().query("INSERT INTO focusflow_scenes (key, content, content_type) VALUES ($1, $2, $3) ON CONFLICT(key) DO UPDATE SET content = excluded.content, content_type = excluded.content_type", [key, Buffer.from(bytes).toString("base64"), options.httpMetadata.contentType]);
  },
  async delete(key: string) { await sqlClient().query("DELETE FROM focusflow_scenes WHERE key = $1", [key]); },
};

// Only the native Sites runtime uses Drizzle's D1-specific methods.
export const env = { DB, BUCKET } as unknown as { DB: D1Database; BUCKET: R2Bucket };
