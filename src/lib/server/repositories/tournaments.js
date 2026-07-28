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
