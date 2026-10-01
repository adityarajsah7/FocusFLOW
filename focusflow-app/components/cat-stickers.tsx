export type StickerFace = "sleepy" | "love" | "smug" | "laugh" | "shock" | "angry" | "cry" | "plead";
export type StickerMood = "cozy" | "fun" | "angry" | "tantrum";
export type CatSticker = { line: string; face: StickerFace; mood: StickerMood; badge: string };
const pack: Record<StickerFace, { mood: StickerMood; badge: string; lines: string[] }> = {
  sleepy: { mood: "cozy", badge: "☁", lines: ["Bas 5 minute aur…", "Aaj ka plan: chai aur nap.", "Battery low. Cuddle lagao.", "Main busy hoon. Sone mein.", "Duniya fast hai, main soft hoon."] },
  love: { mood: "cozy", badge: "♥", lines: ["Tu aa gaya? Ab sab cozy hai.", "Ek hug toh banta hai!", "Tere liye purr-sonal support.", "Chhota step bhi progress hai, yaar.", "Aaj khud se thoda pyaar kar."] },
  smug: { mood: "fun", badge: "✦", lines: ["Cute hoon. Discount nahi milega.", "Main nahi, meri vibe kaam karti hai.", "Attitude? Complimentary hai.", "Meri entry, tumhari productivity exit.", "Chai pe charcha, snacks pe kabza."] },
  laugh: { mood: "fun", badge: "✿", lines: ["Ek brain cell, full entertainment!", "Kaam bhi hoga, masti bhi hogi.", "Zoomies ka koi syllabus nahi.", "Aaj toh paws-itive rehna padega!", "Task done? Party meri taraf se: meow!"] },
  shock: { mood: "fun", badge: "?!", lines: ["Itne tabs?! Bhai saans le!", "Deadline kal thi?!", "Snack khatam? Breaking mews!", "Focus mil gaya?! Screenshot lo!", "Tu productive tha? Main witness hoon!"] },
  angry: { mood: "angry", badge: "💢", lines: ["Meri chai kisne pi?!", "Mood off. Biscuit on.", "Permission li thi pet karne ki?", "Meeting nahi. Meow-ting karo.", "Main gussa nahi. Spicy hoon."] },
  cry: { mood: "tantrum", badge: "☂", lines: ["Snack chahiye, life lesson nahi!", "Meri dramatic entry cancel kisne ki?", "Main ro nahi raha. Face rain hai.", "Itna kaam? Main toh baby hoon.", "Dil toota… bowl bhi khaali."] },
  plead: { mood: "tantrum", badge: "✧", lines: ["Ek treat? Bas ek… packet.", "Mujhe attention ka recharge chahiye.", "Mat jaa, abhi toh cozy hue the.", "Thoda break le le, mere liye?", "Please? Meri aankhein dekho na."] },
};
export const catStickers: CatSticker[] = Object.entries(pack).flatMap(([face, entry]) => entry.lines.map((line) => ({ line, face: face as StickerFace, mood: entry.mood, badge: entry.badge })));

export function StickerCat({ face, badge = "✦" }: { face: StickerFace; badge?: string }) {
  const closed = face === "sleepy" || face === "laugh" || face === "love";
  return <svg viewBox="0 0 220 220" className={`sticker-cat face-${face}`} aria-hidden="true">
    <g stroke="#fffdf6" strokeWidth="14" strokeLinejoin="round"><path d="M49 117 35 31 87 58Q110 48 133 58L185 31 171 117Q195 165 160 194H60Q25 165 49 117Z" fill="#ffcfa0" /></g>
    <path d="M49 117 35 31 87 58Q110 48 133 58L185 31 171 117Q195 165 160 194H60Q25 165 49 117Z" fill="#ffcfa0" stroke="#63453b" strokeWidth="4" strokeLinejoin="round" />
    <path d="m45 47 11 41 22-24m97-17-11 41-22-24" fill="#ee9b9d" />
    <ellipse cx="110" cy="132" rx="64" ry="51" fill="#fff0d8" />
    <path d="m98 59 6 17m11-18-1 19m12-16-5 17" stroke="#e2a56e" strokeWidth="6" strokeLinecap="round" />
    <g className="sticker-eyes" stroke="#543b36" strokeWidth="5" fill="#543b36" strokeLinecap="round">
      {closed ? <><path d={face === "sleepy" ? "M68 113q12 9 24 0M128 113q12 9 24 0" : "M68 116q12-18 24 0M128 116q12-18 24 0"} fill="none" /></> : face === "smug" || face === "angry" ? <><path d={face === "angry" ? "m65 101 28 10m34 0 28-10" : "M65 108h28m34 0h28"} /><ellipse cx="81" cy="120" rx="5" ry="9" /><ellipse cx="140" cy="120" rx="5" ry="9" /></> : <>{[80,140].map((x) => <g key={x}><ellipse cx={x} cy="112" rx={face === "plead" ? 17 : 13} ry={face === "shock" ? 21 : 18} /><circle cx={x-4} cy="106" r="5" fill="white" stroke="none" /><circle cx={x+5} cy="119" r="2.5" fill="white" stroke="none" /></g>)}</>}
    </g>
    <ellipse cx="60" cy="135" rx="12" ry="7" fill="#f59f9f" opacity=".7" /><ellipse cx="161" cy="135" rx="12" ry="7" fill="#f59f9f" opacity=".7" />
    <path d="m104 128 6 5 6-5Z" fill="#bf7278" />
    {face === "shock" ? <ellipse cx="110" cy="150" rx="10" ry="14" fill="#63453b" /> : face === "laugh" ? <><path d="M91 139q19 35 38 0Z" fill="#63453b" /><ellipse cx="110" cy="152" rx="10" ry="5" fill="#ee9b9d" /></> : <path d={face === "cry" || face === "angry" ? "M97 150q13-13 26 0" : "M97 139q6 12 13 0q7 12 13 0"} fill="none" stroke="#63453b" strokeWidth="4" strokeLinecap="round" />}
    {face === "cry" && <g fill="#8bd9fa" className="sticker-tears"><path d="M66 130q-14 24 0 25q14-1 0-25Z" /><path d="M154 130q-14 24 0 25q14-1 0-25Z" /></g>}
    <path d="m46 132-21-4m22 13-23 6m149-15 21-4m-22 13 23 6" stroke="#b78165" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="81" cy="188" rx="19" ry="10" fill="#fff0d8" stroke="#63453b" strokeWidth="3" /><ellipse cx="139" cy="188" rx="19" ry="10" fill="#fff0d8" stroke="#63453b" strokeWidth="3" />
    <text x="185" y="25" textAnchor="middle" fontSize="23" fill="#ffe5a4" stroke="#ffffff" strokeWidth="1">{face === "sleepy" ? "zZ" : badge}</text>
  </svg>;
}
