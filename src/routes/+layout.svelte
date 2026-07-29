<script>
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/app.css';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="header-inner">
		<a class="logo" href="/">
			<span class="piece" aria-hidden="true">&#9822;</span>
			Chess Tournament Manager
		</a>
		<nav class="site-nav">
			<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>Home</a>
			<a href="/players" aria-current={page.url.pathname.startsWith('/players') ? 'page' : undefined}>Players</a>
			<a
				href="/tournaments"
				aria-current={page.url.pathname.startsWith('/tournaments') ? 'page' : undefined}
			>
				Tournaments
			</a>
		</nav>
	</div>
</header>

{@render children()}
