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
</style>
