<script>
	let { data } = $props();

	let expandedIds = $state(new Set());

	function toggle(id) {
		const next = new Set(expandedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedIds = next;
	}

	function statusLabel(status) {
		return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
	}
</script>

<svelte:head>
	<title>Chess Tournament Manager</title>
</svelte:head>

<main class="page">
	<h1>Chess Tournament Manager</h1>
	<p class="subtitle">
		Manage players, run tournaments, and let the system randomly pair and score matches.
	</p>

	<div class="stats-bar">
		<div class="stat">
			<span class="stat-value">{data.stats.totalPlayers}</span>
			<span class="stat-label">Players</span>
		</div>
		<div class="stat">
			<span class="stat-value">{data.stats.totalTournaments}</span>
			<span class="stat-label">Tournaments</span>
		</div>
		<div class="stat">
			<span class="stat-value">{data.stats.ongoingTournaments}</span>
			<span class="stat-label">Ongoing</span>
		</div>
		<div class="stat">
			<span class="stat-value">{data.stats.totalMatches}</span>
			<span class="stat-label">Matches Played</span>
		</div>
	</div>

	{#if data.ongoingTournaments.length > 0}
		<section class="ongoing">
			<h2>Ongoing Tournaments</h2>
			<div class="ongoing-list">
				{#each data.ongoingTournaments as t (t.id)}
					<div class="ongoing-card">
						<button
							type="button"
							class="ongoing-header"
							onclick={() => toggle(t.id)}
							aria-expanded={expandedIds.has(t.id)}
						>
							<div class="ongoing-header-main">
								<h3>{t.name}</h3>
								<span class="badge in_progress">{statusLabel(t.status)}</span>
							</div>
							<div class="ongoing-meta">
								<span>{t.player_count} players</span>
								<span>Round {t.current_round}</span>
								<span>{t.matches_played} matches played</span>
								{#if t.leader_name}
									<span class="leader">Leading: {t.leader_name}</span>
								{/if}
							</div>
							<svg
								class="chevron"
								class:open={expandedIds.has(t.id)}
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>

						{#if expandedIds.has(t.id)}
							<div class="leaderboard">
								{#if t.rankings.length === 0}
									<p class="empty">No standings yet.</p>
								{:else}
									<table class="data-table">
										<thead>
											<tr>
												<th>Rank</th>
												<th>Name</th>
												<th>Rating</th>
												<th>Points</th>
											</tr>
										</thead>
										<tbody>
											{#each t.rankings as p, i (p.id)}
												<tr>
													<td>{i + 1}</td>
													<td>{p.name}</td>
													<td>{p.rating}</td>
													<td>{p.points}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								{/if}
								<a class="view-link" href={`/tournaments/${t.id}`}>View full tournament &rarr;</a>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<div class="cards">
		<a class="card link-card" href="/players">
			<h2>Players</h2>
			<p>Add, edit, and remove players.</p>
		</a>
		<a class="card link-card" href="/tournaments">
			<h2>Tournaments</h2>
			<p>Create tournaments, register players, generate rounds, and view final rankings.</p>
		</a>
	</div>
</main>

<style>
	.cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.link-card {
		text-decoration: none;
		color: inherit;
		display: block;
		transition: border-color 0.15s;
	}

	.link-card:hover {
		border-color: var(--accent);
	}

	.link-card h2 {
		color: var(--accent);
	}

	.link-card p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	@media (max-width: 600px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}

	.ongoing {
		margin-bottom: 2rem;
	}

	.ongoing h2 {
		margin-bottom: 0.75rem;
	}

	.ongoing-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.ongoing-card {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
	}

	.ongoing-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem 1.25rem;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}

	.ongoing-header:hover {
		background: #fafbfc;
	}

	.ongoing-header-main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.ongoing-header-main h3 {
		margin: 0;
		font-size: 1rem;
	}

	.ongoing-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: var(--text-secondary);
		flex: 1;
	}

	.leader {
		color: var(--accent);
		font-weight: 600;
	}

	.chevron {
		flex-shrink: 0;
		transition: transform 0.15s;
		color: var(--text-muted);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.leaderboard {
		padding: 0 1.25rem 1.25rem;
		border-top: 1px solid var(--border);
	}

	.leaderboard table {
		margin-top: 0.75rem;
	}

	.leaderboard .view-link {
		display: inline-block;
		margin-top: 0.75rem;
		font-size: 0.85rem;
		text-decoration: none;
		font-weight: 600;
	}

	@media (max-width: 600px) {
		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.ongoing-header {
			flex-wrap: wrap;
		}
	}
</style>
