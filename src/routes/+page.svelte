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
</style>
