// src/lib/server/repositories/players.js
//
// Data access layer for players. Keeps raw SQL out of routes/components.

import { randomUUID } from 'node:crypto';
import db from '../db.js';

/** @returns {Array<object>} all players, most recently created first */
export function listPlayers() {
	return db.prepare('SELECT * FROM players ORDER BY created_at DESC').all();
}

/** @param {string} id */
export function getPlayer(id) {
	return db.prepare('SELECT * FROM players WHERE id = ?').get(id);
}

/**
 * @param {{ name: string, email?: string, rating?: number }} data
 * @returns {object} the created player
 */
export function createPlayer({ name, email, rating }) {
	if (!name || !name.trim()) {
		throw new Error('Player name is required');
	}

	const id = randomUUID();
	const parsedRating = Number.isFinite(Number(rating)) ? Number(rating) : 1200;

	db.prepare(
		`INSERT INTO players (id, name, email, rating)
		 VALUES (?, ?, ?, ?)`
	).run(id, name.trim(), email?.trim() || null, parsedRating);

	return getPlayer(id);
}

/**
 * @param {string} id
 * @param {{ name?: string, email?: string, rating?: number }} data
 * @returns {object} the updated player
 */
export function updatePlayer(id, { name, email, rating }) {
	const existing = getPlayer(id);
	if (!existing) {
		throw new Error('Player not found');
	}
	if (name !== undefined && !name.trim()) {
		throw new Error('Player name cannot be empty');
	}

	db.prepare(
		`UPDATE players
		 SET name = ?, email = ?, rating = ?, updated_at = datetime('now')
		 WHERE id = ?`
	).run(
		name !== undefined ? name.trim() : existing.name,
		email !== undefined ? email?.trim() || null : existing.email,
		rating !== undefined && Number.isFinite(Number(rating)) ? Number(rating) : existing.rating,
		id
	);

	return getPlayer(id);
}

/** @param {string} id */
export function deletePlayer(id) {
	const existing = getPlayer(id);
	if (!existing) {
		throw new Error('Player not found');
	}
	db.prepare('DELETE FROM players WHERE id = ?').run(id);
	return existing;
}
