import { error, fail } from '@sveltejs/kit';
import { getTournament } from '$lib/server/repositories/tournaments.js';
import {
	listPlayersInTournament,
	listPlayersNotInTournament,
	addPlayerToTournament,
	removePlayerFromTournament
} from '$lib/server/repositories/tournament-players.js';

export function load({ params }) {
	const tournament = getTournament(params.id);
	if (!tournament) {
		throw error(404, 'Tournament not found');
	}

	return {
		tournament,
		registeredPlayers: listPlayersInTournament(params.id),
		availablePlayers: listPlayersNotInTournament(params.id)
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
	}
};
