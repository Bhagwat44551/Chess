<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	/** @type {string | null} id of the player currently being edited, or null */
	let editingId = $state(null);

	function startEdit(id) {
		editingId = id;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<svelte:head>
	<title>Players · Chess Tournament</title>
</svelte:head>

<main>
	<nav>
		<a href="/">Home</a>
		<a href="/players" aria-current="page">Players</a>
		<a href="/tournaments">Tournaments</a>
	</nav>

	<h1>Players</h1>

	{#if form?.error}
		<p class="error" role="alert">{form.error}</p>
	{/if}

	<section class="add-player">
		<h2>Add Player</h2>
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<label>
				Name
				<input type="text" name="name" required placeholder="e.g. Magnus Carlsen" />
			</label>
			<label>
				Email (optional)
				<input type="email" name="email" placeholder="e.g. player@example.com" />
			</label>
			<label>
				Rating
				<input type="number" name="rating" value="1200" min="0" />
			</label>
			<button type="submit">Add Player</button>
		</form>
	</section>

	<section class="player-list">
		<h2>All Players ({data.players.length})</h2>

		{#if data.players.length === 0}
			<p class="empty">No players yet. Add one above to get started.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Rating</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.players as player (player.id)}
						<tr>
							{#if editingId === player.id}
								<td colspan="4">
									<form
										method="POST"
										action="?/update"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												editingId = null;
											};
										}}
										class="edit-row"
									>
										<input type="hidden" name="id" value={player.id} />
										<input type="text" name="name" value={player.name} required />
										<input type="email" name="email" value={player.email ?? ''} />
										<input type="number" name="rating" value={player.rating} min="0" />
										<button type="submit">Save</button>
										<button type="button" onclick={cancelEdit}>Cancel</button>
									</form>
								</td>
							{:else}
								<td>{player.name}</td>
								<td>{player.email ?? '—'}</td>
								<td>{player.rating}</td>
								<td class="actions">
									<button type="button" onclick={() => startEdit(player.id)}>Edit</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Delete ${player.name}?`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={player.id} />
										<button type="submit" class="danger">Delete</button>
									</form>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
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
		margin-bottom: 1.5rem;
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
		margin-bottom: 1rem;
	}

	.error {
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
	}

	.add-player form {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
		margin-bottom: 2rem;
	}

	.add-player label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 0.25rem;
	}

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

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions form {
		display: inline;
	}

	.edit-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.empty {
		color: #666;
	}
</style>
