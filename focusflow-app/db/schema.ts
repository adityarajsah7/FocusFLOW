import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const focusflowState = sqliteTable("focusflow_state", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const focusflowUsers = sqliteTable("focusflow_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  createdAt: text("created_at").notNull(),
});

export const focusflowSessions = sqliteTable("focusflow_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => focusflowUsers.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const focusflowUserState = sqliteTable("focusflow_user_state", {
  userId: text("user_id").primaryKey().references(() => focusflowUsers.id, { onDelete: "cascade" }),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull(),
});
