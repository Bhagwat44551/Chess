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

<main class="page">
	<h1>Tournaments</h1>
	<p class="subtitle">Create tournaments, register players, and manage rounds.</p>

	{#if form?.error}
		<p class="error-banner" role="alert">{form.error}</p>
	{/if}

	<section class="card add-tournament">
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

	<section class="card tournament-list">
		<h2>All Tournaments ({data.tournaments.length})</h2>

		{#if data.tournaments.length === 0}
			<p class="empty">No tournaments yet. Create one above to get started.</p>
		{:else}
			<table class="data-table">
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
										<button type="button" class="secondary" onclick={cancelEdit}>Cancel</button>
									</form>
								</td>
							{:else}
								<td><a href={`/tournaments/${t.id}`}>{t.name}</a></td>
								<td>{t.description ?? '—'}</td>
								<td><span class="badge {t.status}">{statusLabel(t.status)}</span></td>
								<td class="actions">
									<button type="button" class="secondary" onclick={() => startEdit(t.id)}>Edit</button>
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
	.add-tournament {
		margin-bottom: 1.5rem;
	}

	.add-tournament form {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.add-tournament label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 0.25rem;
		color: var(--text-secondary);
	}

	.tournament-list {
		padding: 0;
		overflow: hidden;
	}

	.tournament-list h2 {
		padding: 1.25rem 1.5rem 0;
	}

	.tournament-list table {
		margin-top: 1rem;
	}

	.tournament-list .empty {
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
