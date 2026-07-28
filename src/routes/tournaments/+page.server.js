import { fail } from '@sveltejs/kit';
import {
	listTournaments,
	createTournament,
	updateTournament,
	deleteTournament
} from '$lib/server/repositories/tournaments.js';

export function load() {
	return {
		tournaments: listTournaments()
	};
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString() ?? '';
		const description = form.get('description')?.toString() ?? '';

		try {
			createTournament({ name, description });
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const name = form.get('name')?.toString() ?? '';
		const description = form.get('description')?.toString() ?? '';
		const status = form.get('status')?.toString();

		if (!id) return fail(400, { error: 'Missing tournament id' });

		try {
			updateTournament(id, { name, description, status });
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();

		if (!id) return fail(400, { error: 'Missing tournament id' });

		try {
			deleteTournament(id);
		} catch (err) {
			return fail(400, { error: err.message });
		}

		return { success: true };
	}
};
