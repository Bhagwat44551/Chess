import { error, fail } from '@sveltejs/kit';
import { getTournament } from '$lib/server/repositories/tournaments.js';
import {
	listPlayersInTournament,
	listPlayersNotInTournament,
	addPlayerToTournament,
	removePlayerFromTournament
} from '$lib/server/repositories/tournament-players.js';
import { generateRound, listMatches, getRankings } from '$lib/server/repositories/matches.js';

export function load({ params }) {
	const tournament = getTournament(params.id);
	if (!tournament) {
		throw error(404, 'Tournament not found');
	}

	return {
		tournament,
		registeredPlayers: listPlayersInTournament(params.id),
		availablePlayers: listPlayersNotInTournament(params.id),
		matches: listMatches(params.id),
		rankings: getRankings(params.id)
	};
}

export const actions = {
	addPlayer: async ({ request, params }) => {
		const form = await request.formData();
		const playerId = form.get('playerId')?.toString();

		if (!playerId) return fail(400, { error: 'Please choose a player to add' });

		try {
			addPlayerToTournament(params.id, playerId);
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	},

	removePlayer: async ({ request, params }) => {
		const form = await request.formData();
		const playerId = form.get('playerId')?.toString();

		if (!playerId) return fail(400, { error: 'Missing player id' });

		try {
			removePlayerFromTournament(params.id, playerId);
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	},

	generateRound: async ({ params }) => {
		try {
			const result = generateRound(params.id);
			return { success: true, round: result.round };
		} catch (err) {
			return fail(400, { error: err.message });
		}
	}
};
