// src/lib/server/repositories/tournaments.js
//
// Data access layer for tournaments.

import { randomUUID } from 'node:crypto';
import db from '../db.js';

const VALID_STATUSES = ['pending', 'in_progress', 'completed'];

/** @returns {Array<object>} all tournaments, most recently created first */
export function listTournaments() {
	return db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC').all();
}

/** @param {string} id */
export function getTournament(id) {
	return db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);
}

/**
 * @param {{ name: string, description?: string, status?: string }} data
 * @returns {object} the created tournament
 */
export function createTournament({ name, description, status }) {
	if (!name || !name.trim()) {
		throw new Error('Tournament name is required');
	}
	const finalStatus = status && VALID_STATUSES.includes(status) ? status : 'pending';

	const id = randomUUID();
	db.prepare(
		`INSERT INTO tournaments (id, name, description, status)
		 VALUES (?, ?, ?, ?)`
	).run(id, name.trim(), description?.trim() || null, finalStatus);

	return getTournament(id);
}

/**
 * @param {string} id
 * @param {{ name?: string, description?: string, status?: string }} data
 * @returns {object} the updated tournament
 */
export function updateTournament(id, { name, description, status }) {
	const existing = getTournament(id);
	if (!existing) {
		throw new Error('Tournament not found');
	}
	if (name !== undefined && !name.trim()) {
		throw new Error('Tournament name cannot be empty');
	}
	if (status !== undefined && !VALID_STATUSES.includes(status)) {
		throw new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
	}

	db.prepare(
		`UPDATE tournaments
		 SET name = ?, description = ?, status = ?, updated_at = datetime('now')
		 WHERE id = ?`
	).run(
		name !== undefined ? name.trim() : existing.name,
		description !== undefined ? description?.trim() || null : existing.description,
		status !== undefined ? status : existing.status,
		id
	);

	return getTournament(id);
}

/** @param {string} id */
export function deleteTournament(id) {
	const existing = getTournament(id);
	if (!existing) {
		throw new Error('Tournament not found');
	}
	db.prepare('DELETE FROM tournaments WHERE id = ?').run(id);
	return existing;
}

/**
 * Tournaments currently in progress, with player count, matches played, and
 * current round — used for the homepage "ongoing tournaments" summary.
 */
export function listOngoingTournamentsWithStats() {
	return db
		.prepare(
			`SELECT
				t.*,
				(SELECT COUNT(*) FROM tournament_players tp WHERE tp.tournament_id = t.id) AS player_count,
				(SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) AS matches_played,
				(SELECT COALESCE(MAX(m.round), 0) FROM matches m WHERE m.tournament_id = t.id) AS current_round,
				(SELECT p.name
				 FROM tournament_players tp
				 JOIN players p ON p.id = tp.player_id
				 WHERE tp.tournament_id = t.id
				 ORDER BY tp.points DESC, p.rating DESC
				 LIMIT 1) AS leader_name
			 FROM tournaments t
			 WHERE t.status = 'in_progress'
			 ORDER BY t.updated_at DESC`
		)
		.all();
}

/**
 * Overall counts for the homepage stats bar.
 */
export function getOverallStats() {
	const players = db.prepare('SELECT COUNT(*) AS count FROM players').get();
	const tournaments = db.prepare('SELECT COUNT(*) AS count FROM tournaments').get();
	const ongoing = db
		.prepare(`SELECT COUNT(*) AS count FROM tournaments WHERE status = 'in_progress'`)
		.get();
	const matches = db.prepare('SELECT COUNT(*) AS count FROM matches').get();

	return {
		totalPlayers: players.count,
		totalTournaments: tournaments.count,
		ongoingTournaments: ongoing.count,
		totalMatches: matches.count
	};
}
