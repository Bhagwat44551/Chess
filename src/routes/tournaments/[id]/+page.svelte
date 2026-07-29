<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function statusLabel(status) {
		return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
	}

	function resultLabel(result) {
		return { white_win: 'White wins', black_win: 'Black wins', draw: 'Draw' }[result] ?? result;
	}

	function resultCircleClass(result) {
		return { white_win: 'white-win', black_win: 'black-win', draw: 'draw' }[result] ?? '';
	}

	function resultLetter(result) {
		return { white_win: 'W', black_win: 'B', draw: 'D' }[result] ?? '?';
	}
</script>

<svelte:head>
	<title>{data.tournament.name} · Chess Tournament</title>
</svelte:head>

<main class="page">
	<a class="back" href="/tournaments">&larr; All tournaments</a>

	<h1>{data.tournament.name}</h1>
	{#if data.tournament.description}
		<p class="subtitle" style="margin-bottom: 0.5rem;">{data.tournament.description}</p>
	{/if}
	<span class="badge {data.tournament.status}" style="margin-bottom: 1.75rem; display: inline-block;">
		{statusLabel(data.tournament.status)}
	</span>

	{#if form?.error}
		<p class="error-banner" role="alert">{form.error}</p>
	{/if}

	<section class="card add-player">
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

	<section class="card registered-players">
		<h2>Registered Players ({data.registeredPlayers.length})</h2>

		{#if data.registeredPlayers.length === 0}
			<p class="empty">No players registered yet.</p>
		{:else}
			<table class="data-table">
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

	<section class="card match-system">
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
				<table class="data-table">
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
								<td>
									<span class="result-circle {resultCircleClass(m.result)}">{resultLetter(m.result)}</span>
									<span class="result-text">{resultLabel(m.result)}</span>
								</td>
								<td>{m.winner_name ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/each}
		{/if}
	</section>

	<section class="card rankings">
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
				<table class="data-table">
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
	.back {
		display: inline-block;
		margin-bottom: 1rem;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
	}

	section {
		margin-bottom: 1.5rem;
	}

	.add-player form {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.registered-players,
	.match-system {
		padding: 0;
		overflow: hidden;
	}

	.registered-players h2,
	.match-system h2 {
		padding: 1.25rem 1.5rem 0;
	}

	.registered-players table {
		margin-top: 1rem;
	}

	.registered-players .empty {
		padding: 0 1.5rem 1.5rem;
	}

	.match-system form {
		padding: 0 1.5rem;
		margin: 1rem 0;
	}

	.match-system h3 {
		padding: 0 1.5rem;
		margin: 1.25rem 0 0.5rem;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.match-system table {
		margin-bottom: 0.5rem;
	}

	.match-system .empty {
		padding: 0 1.5rem 1.5rem;
	}

	.result-text {
		margin-left: 0.5rem;
		vertical-align: middle;
		font-size: 0.85rem;
		color: var(--text-secondary);
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
		padding: 1.25rem 1rem;
		border-radius: 8px;
		background: #fafbfc;
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.place-1 {
		border-color: #f0d27a;
		background: #fdf6e3;
		order: 2;
	}

	.place-2 {
		order: 1;
	}

	.place-3 {
		border-color: #e0c2a3;
		background: #fbf3ec;
		order: 3;
	}

	.medal {
		font-size: 1.75rem;
	}

	.name {
		font-weight: 700;
	}

	.points {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
</style>
