// src/lib/server/repositories/matches.js
//
// The random match system: pairs registered players randomly, picks a
// random winner for each pairing, records the result, and awards points.
// Also computes final rankings from accumulated points.

import { randomUUID } from 'node:crypto';
import db from '../db.js';
import { listPlayersInTournament, addPointsToPlayer } from './tournament-players.js';

const POINTS_FOR_WIN = 1;
const POINTS_FOR_BYE = 1;

/** Fisher-Yates shuffle. Returns a new shuffled array, does not mutate input. */
function shuffle(array) {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/** @param {string} tournamentId */
function currentRoundNumber(tournamentId) {
	const row = db
		.prepare('SELECT MAX(round) AS maxRound FROM matches WHERE tournament_id = ?')
		.get(tournamentId);
	return (row?.maxRound ?? 0) + 1;
}

/**
 * Randomly pairs all registered players for a new round, randomly picks a
 * winner for each pairing, and records the results.
 *
 * If there's an odd number of players, one randomly-chosen player receives
 * a bye (an automatic point, no match played) for that round.
 *
 * @param {string} tournamentId
 * @returns {{ round: number, matches: Array<object>, bye: object | null }}
 */
export function generateRound(tournamentId) {
	const registered = listPlayersInTournament(tournamentId);

	if (registered.length < 2) {
		throw new Error('At least 2 players must be registered to generate a round');
	}

	const shuffled = shuffle(registered);
	const round = currentRoundNumber(tournamentId);

	let bye = null;
	const pairPool = [...shuffled];
	if (pairPool.length % 2 !== 0) {
		bye = pairPool.pop();
		addPointsToPlayer(tournamentId, bye.id, POINTS_FOR_BYE);
	}

	const createdMatches = [];
	const insertMatch = db.prepare(
		`INSERT INTO matches (id, tournament_id, round, player_white, player_black, winner_id, result)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`
	);

	for (let i = 0; i < pairPool.length; i += 2) {
		const white = pairPool[i];
		const black = pairPool[i + 1];

		// Randomly select a winner between the two players.
		const whiteWins = Math.random() < 0.5;
		const winner = whiteWins ? white : black;
		const result = whiteWins ? 'white_win' : 'black_win';

		const matchId = randomUUID();
		insertMatch.run(matchId, tournamentId, round, white.id, black.id, winner.id, result);
		addPointsToPlayer(tournamentId, winner.id, POINTS_FOR_WIN);

		createdMatches.push({
			id: matchId,
			round,
			white,
			black,
			winner,
			result
		});
	}

	return { round, matches: createdMatches, bye };
}

/**
 * All matches for a tournament, with player names joined in, ordered by round.
 * @param {string} tournamentId
 */
export function listMatches(tournamentId) {
	return db
		.prepare(
			`SELECT
				m.id, m.round, m.result, m.played_at,
				pw.id AS white_id, pw.name AS white_name,
				pb.id AS black_id, pb.name AS black_name,
				pwin.id AS winner_id, pwin.name AS winner_name
			 FROM matches m
			 JOIN players pw ON pw.id = m.player_white
			 JOIN players pb ON pb.id = m.player_black
			 LEFT JOIN players pwin ON pwin.id = m.winner_id
			 WHERE m.tournament_id = ?
			 ORDER BY m.round ASC, m.played_at ASC`
		)
		.all(tournamentId);
}

/**
 * Final rankings for a tournament, ordered by points (desc), rating (desc) as tiebreak.
 * @param {string} tournamentId
 */
export function getRankings(tournamentId) {
	return db
		.prepare(
			`SELECT p.id, p.name, p.rating, tp.points
			 FROM tournament_players tp
			 JOIN players p ON p.id = tp.player_id
			 WHERE tp.tournament_id = ?
			 ORDER BY tp.points DESC, p.rating DESC, p.name ASC`
		)
		.all(tournamentId);
}
