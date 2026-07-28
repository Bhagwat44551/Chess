// src/lib/server/db.js
//
// Database connection + schema setup for the Chess Tournament Management System.
// Uses Node's built-in `node:sqlite` module (available in Node 22+), so no
// native compilation step or extra dependency is required.

import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || 'data/chess-tournament.db';

// Ensure the folder that will hold the sqlite file exists.
const dir = dirname(DB_PATH);
if (dir && dir !== '.' && !existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

// A single shared connection for the lifetime of the server process.
const db = new DatabaseSync(DB_PATH);

// Sensible defaults for a small single-file app.
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
	CREATE TABLE IF NOT EXISTS players (
		id         TEXT PRIMARY KEY,
		name       TEXT NOT NULL,
		email      TEXT,
		rating     INTEGER NOT NULL DEFAULT 1200,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
`);

db.exec(`
	CREATE TABLE IF NOT EXISTS tournaments (
		id          TEXT PRIMARY KEY,
		name        TEXT NOT NULL,
		description TEXT,
		status      TEXT NOT NULL DEFAULT 'pending'
			CHECK (status IN ('pending', 'in_progress', 'completed')),
		created_at  TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
	);
`);

// Join table: which players are registered in which tournament.
db.exec(`
	CREATE TABLE IF NOT EXISTS tournament_players (
		id            TEXT PRIMARY KEY,
		tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
		player_id     TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
		points        REAL NOT NULL DEFAULT 0,
		joined_at     TEXT NOT NULL DEFAULT (datetime('now')),
		UNIQUE (tournament_id, player_id)
	);
`);

db.exec(`
	CREATE TABLE IF NOT EXISTS matches (
		id             TEXT PRIMARY KEY,
		tournament_id  TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
		round          INTEGER NOT NULL DEFAULT 1,
		player_white   TEXT NOT NULL REFERENCES players(id),
		player_black   TEXT NOT NULL REFERENCES players(id),
		winner_id      TEXT REFERENCES players(id),
		result         TEXT NOT NULL DEFAULT 'pending'
			CHECK (result IN ('pending', 'white_win', 'black_win', 'draw')),
		played_at      TEXT NOT NULL DEFAULT (datetime('now'))
	);
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_tp_tournament ON tournament_players(tournament_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);`);

export default db;
