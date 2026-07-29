<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

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

<main class="page">
	<h1>Players</h1>
	<p class="subtitle">Add, edit, and remove players in the system.</p>

	{#if form?.error}
		<p class="error-banner" role="alert">{form.error}</p>
	{/if}

	<section class="card add-player">
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

	<section class="card player-list">
		<h2>All Players ({data.players.length})</h2>

		{#if data.players.length === 0}
			<p class="empty">No players yet. Add one above to get started.</p>
		{:else}
			<table class="data-table">
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
										<button type="button" class="secondary" onclick={cancelEdit}>Cancel</button>
									</form>
								</td>
							{:else}
								<td>{player.name}</td>
								<td>{player.email ?? '—'}</td>
								<td>{player.rating}</td>
								<td class="actions">
									<button type="button" class="secondary" onclick={() => startEdit(player.id)}>Edit</button>
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
	.add-player {
		margin-bottom: 1.5rem;
	}

	.add-player form {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.add-player label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 0.25rem;
		color: var(--text-secondary);
	}

	.player-list {
		padding: 0;
		overflow: hidden;
	}

	.player-list h2 {
		padding: 1.25rem 1.5rem 0;
	}

	.player-list table {
		margin-top: 1rem;
	}

	.player-list .empty {
		padding: 0 1.5rem 1.5rem;
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
</style>
