import { listOngoingTournamentsWithStats, getOverallStats } from '$lib/server/repositories/tournaments.js';
import { getRankings } from '$lib/server/repositories/matches.js';

export function load() {
	const ongoingTournaments = listOngoingTournamentsWithStats().map((t) => ({
		...t,
		rankings: getRankings(t.id)
	}));

	return {
		stats: getOverallStats(),
		ongoingTournaments
	};
}
