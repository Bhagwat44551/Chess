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

	function statusLabel(status) {
		return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
	}
</script>

<svelte:head>
	<title>Tournaments · Chess Tournament</title>
</svelte:head>

<main>
	<nav>
		<a href="/">Home</a>
		<a href="/players">Players</a>
		<a href="/tournaments" aria-current="page">Tournaments</a>
	</nav>

	<h1>Tournaments</h1>

	{#if form?.error}
		<p class="error" role="alert">{form.error}</p>
	{/if}

	<section class="add-tournament">
		<h2>Create Tournament</h2>
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
				<input type="text" name="name" required placeholder="e.g. Summer Open 2026" />
			</label>
			<label>
				Description (optional)
				<input type="text" name="description" placeholder="e.g. Weekly club tournament" />
			</label>
			<button type="submit">Create Tournament</button>
		</form>
	</section>

	<section class="tournament-list">
		<h2>All Tournaments ({data.tournaments.length})</h2>

		{#if data.tournaments.length === 0}
			<p class="empty">No tournaments yet. Create one above to get started.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.tournaments as t (t.id)}
						<tr>
							{#if editingId === t.id}
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
										<input type="hidden" name="id" value={t.id} />
										<input type="text" name="name" value={t.name} required />
										<input type="text" name="description" value={t.description ?? ''} />
										<select name="status">
											<option value="pending" selected={t.status === 'pending'}>Pending</option>
											<option value="in_progress" selected={t.status === 'in_progress'}>In Progress</option>
											<option value="completed" selected={t.status === 'completed'}>Completed</option>
										</select>
										<button type="submit">Save</button>
										<button type="button" onclick={cancelEdit}>Cancel</button>
									</form>
								</td>
							{:else}
								<td><a href={`/tournaments/${t.id}`}>{t.name}</a></td>
								<td>{t.description ?? '—'}</td>
								<td><span class="badge {t.status}">{statusLabel(t.status)}</span></td>
								<td class="actions">
									<button type="button" onclick={() => startEdit(t.id)}>Edit</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Delete tournament "${t.name}"?`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={t.id} />
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

	.add-tournament form {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
		margin-bottom: 2rem;
	}

	.add-tournament label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 0.25rem;
	}

	input,
	select {
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

	a {
		color: #2f6feb;
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

	.badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.8rem;
		background: #eee;
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

	.empty {
		color: #666;
	}
</style>
