// src/lib/server/repositories/tournament-players.js
//
// Manages which players are registered in which tournament.

import { randomUUID } from 'node:crypto';
import db from '../db.js';

/**
 * Players registered in a tournament, joined with their player info.
 * @param {string} tournamentId
 */
export function listPlayersInTournament(tournamentId) {
	return db
		.prepare(
			`SELECT tp.id AS entry_id, tp.points, tp.joined_at, p.*
			 FROM tournament_players tp
			 JOIN players p ON p.id = tp.player_id
			 WHERE tp.tournament_id = ?
			 ORDER BY tp.points DESC, p.name ASC`
		)
		.all(tournamentId);
}

/**
 * Players NOT yet registered in a tournament (for the "add player" dropdown).
 * @param {string} tournamentId
 */
export function listPlayersNotInTournament(tournamentId) {
	return db
		.prepare(
			`SELECT * FROM players
			 WHERE id NOT IN (
				 SELECT player_id FROM tournament_players WHERE tournament_id = ?
			 )
			 ORDER BY name ASC`
		)
		.all(tournamentId);
}

/**
 * @param {string} tournamentId
 * @param {string} playerId
 */
export function addPlayerToTournament(tournamentId, playerId) {
	const tournament = db.prepare('SELECT id FROM tournaments WHERE id = ?').get(tournamentId);
	if (!tournament) throw new Error('Tournament not found');

	const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
	if (!player) throw new Error('Player not found');

	const existing = db
		.prepare('SELECT id FROM tournament_players WHERE tournament_id = ? AND player_id = ?')
		.get(tournamentId, playerId);
	if (existing) throw new Error('Player is already registered in this tournament');

	const id = randomUUID();
	db.prepare(
		`INSERT INTO tournament_players (id, tournament_id, player_id)
		 VALUES (?, ?, ?)`
	).run(id, tournamentId, playerId);

	return { id, tournamentId, playerId };
}

/**
 * @param {string} tournamentId
 * @param {string} playerId
 */
export function removePlayerFromTournament(tournamentId, playerId) {
	const result = db
		.prepare('DELETE FROM tournament_players WHERE tournament_id = ? AND player_id = ?')
		.run(tournamentId, playerId);

	if (result.changes === 0) {
		throw new Error('Player is not registered in this tournament');
	}
}

/**
 * Adjust a player's points within a tournament (used later by the match system).
 * @param {string} tournamentId
 * @param {string} playerId
 * @param {number} deltaPoints
 */
export function addPointsToPlayer(tournamentId, playerId, deltaPoints) {
	db.prepare(
		`UPDATE tournament_players
		 SET points = points + ?
		 WHERE tournament_id = ? AND player_id = ?`
	).run(deltaPoints, tournamentId, playerId);
}
