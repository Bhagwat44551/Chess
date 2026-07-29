<script>
	let { data } = $props();

	function statusLabel(status) {
		return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
	}
</script>

<svelte:head>
	<title>Chess Tournament Manager</title>
</svelte:head>

<main>
	<nav>
		<a href="/" aria-current="page">Home</a>
		<a href="/players">Players</a>
		<a href="/tournaments">Tournaments</a>
	</nav>

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
					<a class="ongoing-card" href={`/tournaments/${t.id}`}>
						<div class="ongoing-header">
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
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<div class="cards">
		<a class="card" href="/players">
			<h2>Players</h2>
			<p>Add, edit, and remove players.</p>
		</a>
		<a class="card" href="/tournaments">
			<h2>Tournaments</h2>
			<p>Create tournaments, register players, generate rounds, and view final rankings.</p>
		</a>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: system-ui, sans-serif;
	}

	nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	nav a {
		text-decoration: none;
		color: #333;
	}

	nav a[aria-current='page'] {
		font-weight: bold;
		color: #1a1a1a;
	}

	h1 {
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #555;
		margin-top: 0;
		margin-bottom: 2rem;
	}

	.cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.card {
		display: block;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s;
	}

	.card:hover {
		border-color: #2f6feb;
	}

	.card h2 {
		margin: 0 0 0.5rem;
		color: #2f6feb;
	}

	.card p {
		margin: 0;
		color: #555;
		font-size: 0.9rem;
	}

	@media (max-width: 600px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}

	.stats-bar {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat {
		text-align: center;
		padding: 1rem 0.5rem;
		border: 1px solid #eee;
		border-radius: 8px;
		background: #fafafa;
	}

	.stat-value {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.stat-label {
		display: block;
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.15rem;
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
		display: block;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s;
	}

	.ongoing-card:hover {
		border-color: #2f6feb;
	}

	.ongoing-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.4rem;
	}

	.ongoing-header h3 {
		margin: 0;
		font-size: 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
	}

	.badge.in_progress {
		background: #cfe2ff;
		color: #084298;
	}

	.ongoing-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: #666;
	}

	.leader {
		color: #2f6feb;
		font-weight: 500;
	}

	@media (max-width: 600px) {
		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
