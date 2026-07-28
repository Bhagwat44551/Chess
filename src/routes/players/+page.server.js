import { fail } from '@sveltejs/kit';
import {
	listPlayers,
	createPlayer,
	updatePlayer,
	deletePlayer
} from '$lib/server/repositories/players.js';

export function load() {
	return {
		players: listPlayers()
	};
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString() ?? '';
		const email = form.get('email')?.toString() ?? '';
		const rating = form.get('rating')?.toString() ?? '';

		try {
			createPlayer({ name, email, rating: rating ? Number(rating) : undefined });
		} catch (err) {
			return fail(400, { error: err.message, values: { name, email, rating } });
		}

		return { success: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const name = form.get('name')?.toString() ?? '';
		const email = form.get('email')?.toString() ?? '';
		const rating = form.get('rating')?.toString() ?? '';

		if (!id) return fail(400, { error: 'Missing player id' });

		try {
			updatePlayer(id, { name, email, rating: rating ? Number(rating) : undefined });
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();

		if (!id) return fail(400, { error: 'Missing player id' });

		try {
			deletePlayer(id);
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	}
};
