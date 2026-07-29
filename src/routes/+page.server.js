import { listOngoingTournamentsWithStats, getOverallStats } from '$lib/server/repositories/tournaments.js';

export function load() {
	return {
		stats: getOverallStats(),
		ongoingTournaments: listOngoingTournamentsWithStats()
	};
}
