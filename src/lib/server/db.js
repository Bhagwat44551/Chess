// src/lib/server/db.js
//
// Database connection + schema setup for the Chess Tournament Management System.
// Uses Node's built-in `node:sqlite` module (available in Node 22+), so no
// native compilation step or extra dependency is required.

import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// On Vercel (and most serverless platforms), the deployed app bundle is
// read-only — only `/tmp` is writable. Locally, we use a `data/` folder
// in the project so the file is easy to find and gitignored.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_PATH = process.env.DATABASE_PATH || (isServerless ? '/tmp/chess-tournament.db' : 'data/chess-tournament.db');

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

// Seed a small amount of sample data on a fresh database so a freshly
// deployed / freshly cold-started instance isn't just an empty shell for
// anyone checking out the live demo. Only runs if there are no players yet.
function seedSampleData() {
	const { count } = db.prepare('SELECT COUNT(*) AS count FROM players').get();
	if (count > 0) return;

	const insertPlayer = db.prepare(
		`INSERT INTO players (id, name, email, rating) VALUES (?, ?, ?, ?)`
	);
	const samplePlayers = [
		{ name: 'Alice Nguyen', email: 'alice@example.com', rating: 1620 },
		{ name: 'Ben Carter', email: 'ben@example.com', rating: 1540 },
		{ name: 'Chloe Adams', email: 'chloe@example.com', rating: 1710 },
		{ name: 'Diego Ramirez', email: 'diego@example.com', rating: 1480 },
		{ name: 'Emma Wilson', email: 'emma@example.com', rating: 1590 }
	];
	const playerIds = samplePlayers.map((p) => {
		const id = randomUUID();
		insertPlayer.run(id, p.name, p.email, p.rating);
		return id;
	});

	const tournamentId = randomUUID();
	db.prepare(
		`INSERT INTO tournaments (id, name, description, status) VALUES (?, ?, ?, ?)`
	).run(tournamentId, 'Sample Open 2026', 'A sample tournament to explore the app.', 'pending');

	const insertEntry = db.prepare(
		`INSERT INTO tournament_players (id, tournament_id, player_id) VALUES (?, ?, ?)`
	);
	for (const playerId of playerIds) {
		insertEntry.run(randomUUID(), tournamentId, playerId);
	}
}

seedSampleData();

export default db;
