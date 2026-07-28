<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{data.tournament.name} · Chess Tournament</title>
</svelte:head>

<main>
	<nav>
		<a href="/">Home</a>
		<a href="/players">Players</a>
		<a href="/tournaments">Tournaments</a>
	</nav>

	<a class="back" href="/tournaments">&larr; All tournaments</a>

	<h1>{data.tournament.name}</h1>
	{#if data.tournament.description}
		<p class="description">{data.tournament.description}</p>
	{/if}
	<span class="badge {data.tournament.status}">{data.tournament.status}</span>

	{#if form?.error}
		<p class="error" role="alert">{form.error}</p>
	{/if}

	<section class="add-player">
		<h2>Add Player to Tournament</h2>
		{#if data.availablePlayers.length === 0}
			<p class="empty">
				All existing players are already registered. <a href="/players">Add more players</a> first.
			</p>
		{:else}
			<form method="POST" action="?/addPlayer" use:enhance>
				<select name="playerId" required>
					<option value="" disabled selected>Choose a player…</option>
					{#each data.availablePlayers as p (p.id)}
						<option value={p.id}>{p.name} (rating {p.rating})</option>
					{/each}
				</select>
				<button type="submit">Add to Tournament</button>
			</form>
		{/if}
	</section>

	<section class="registered-players">
		<h2>Registered Players ({data.registeredPlayers.length})</h2>

		{#if data.registeredPlayers.length === 0}
			<p class="empty">No players registered yet.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Rating</th>
						<th>Points</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.registeredPlayers as p (p.id)}
						<tr>
							<td>{p.name}</td>
							<td>{p.rating}</td>
							<td>{p.points}</td>
							<td>
								<form
									method="POST"
									action="?/removePlayer"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Remove ${p.name} from this tournament?`)) e.preventDefault();
									}}
								>
									<input type="hidden" name="playerId" value={p.id} />
									<button type="submit" class="danger">Remove</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section class="match-system">
		<h2>Matches</h2>
		<form
			method="POST"
			action="?/generateRound"
			use:enhance
			onsubmit={(e) => {
				if (data.registeredPlayers.length < 2) {
					alert('Register at least 2 players before generating a round.');
					e.preventDefault();
				}
			}}
		>
			<button type="submit">Generate Random Round</button>
		</form>

		{#if data.matches.length === 0}
			<p class="empty">No matches played yet. Generate a round to randomly pair players.</p>
		{:else}
			{#each [...new Set(data.matches.map((m) => m.round))] as round}
				<h3>Round {round}</h3>
				<table>
					<thead>
						<tr>
							<th>White</th>
							<th>Black</th>
							<th>Result</th>
							<th>Winner</th>
						</tr>
					</thead>
					<tbody>
						{#each data.matches.filter((m) => m.round === round) as m (m.id)}
							<tr>
								<td>{m.white_name}</td>
								<td>{m.black_name}</td>
								<td>{m.result === 'white_win' ? 'White wins' : m.result === 'black_win' ? 'Black wins' : 'Draw'}</td>
								<td>{m.winner_name ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/each}
		{/if}
	</section>

	<section class="rankings">
		<h2>Final Rankings</h2>

		{#if data.rankings.length === 0}
			<p class="empty">No standings yet — register players and generate a round.</p>
		{:else}
			<ol class="podium">
				{#each data.rankings.slice(0, 3) as p, i (p.id)}
					<li class="place place-{i + 1}">
						<span class="medal">{['🥇', '🥈', '🥉'][i]}</span>
						<span class="name">{p.name}</span>
						<span class="points">{p.points} pts</span>
					</li>
				{/each}
			</ol>

			{#if data.rankings.length > 3}
				<table>
					<thead>
						<tr>
							<th>Rank</th>
							<th>Name</th>
							<th>Points</th>
						</tr>
					</thead>
					<tbody>
						{#each data.rankings.slice(3) as p, i (p.id)}
							<tr>
								<td>{i + 4}</td>
								<td>{p.name}</td>
								<td>{p.points}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: system-ui, sans-serif;
	}

	nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	nav a {
		text-decoration: none;
		color: #333;
	}

	.back {
		display: inline-block;
		margin-bottom: 1rem;
		color: #2f6feb;
		text-decoration: none;
	}

	h1 {
		margin-bottom: 0.25rem;
	}

	.description {
		color: #555;
		margin-top: 0;
	}

	.badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.8rem;
		background: #eee;
		margin-bottom: 1.5rem;
	}

	.badge.pending {
		background: #fff3cd;
		color: #856404;
	}

	.badge.in_progress {
		background: #cfe2ff;
		color: #084298;
	}

	.badge.completed {
		background: #d1e7dd;
		color: #0f5132;
	}

	.error {
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	section {
		margin-top: 2rem;
	}

	.add-player form {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	select,
	input {
		padding: 0.4rem 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.45rem 0.9rem;
		border: none;
		border-radius: 4px;
		background: #2f6feb;
		color: white;
		cursor: pointer;
	}

	button.danger {
		background: #d1453b;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		text-align: left;
		padding: 0.6rem;
		border-bottom: 1px solid #eee;
	}

	.empty {
		color: #666;
	}

	.match-system form {
		margin-bottom: 1rem;
	}

	.match-system h3 {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-size: 1rem;
		color: #444;
	}

	.podium {
		list-style: none;
		display: flex;
		gap: 1rem;
		padding: 0;
		margin: 1rem 0;
	}

	.place {
		flex: 1;
		text-align: center;
		padding: 1rem;
		border-radius: 8px;
		background: #f7f7f8;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.place-1 {
		background: #fff3cd;
		order: 2;
	}

	.place-2 {
		background: #f1f1f1;
		order: 1;
	}

	.place-3 {
		background: #f6e6d8;
		order: 3;
	}

	.medal {
		font-size: 1.75rem;
	}

	.name {
		font-weight: 600;
	}

	.points {
		color: #555;
		font-size: 0.9rem;
	}
</style>
