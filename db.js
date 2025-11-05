import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ensure db folder exists
const dbPath = path.resolve("./data");
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

const dbFile = path.join(dbPath, "wizzle.db");
export const db = new Database(dbFile);

// initialize tables if not exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  displayName TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  isGroup INTEGER,
  members TEXT,              -- JSON array
  lastMessage TEXT,          -- JSON
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT,
  senderId TEXT,
  sentAt TEXT,
  kind TEXT,                 -- JSON
  status TEXT
);
`);