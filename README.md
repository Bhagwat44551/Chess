# Chess Tournament Management System

A web app for managing chess tournaments — add players, run tournaments, randomly pair and play matches, and see final rankings.

Built for the Bytelogik Software Developer technical assignment.

## Tech Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** (Svelte 5) — frontend + server routes
- **JavaScript**
- **SQLite** via Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) module — no native compilation or extra dependencies required

## Features

- **Player Management** — create, view, edit, and delete players (name, email, rating), stored in SQLite.
- **Tournament Management** — create, view, edit, and delete tournaments; register/remove players for a specific tournament.
- **Match System** — randomly pairs registered players each round, randomly selects a winner for each match, and records the result. Handles odd player counts with an automatic bye.
- **Rankings** — live standings computed from match points, with a 1st/2nd/3rd place podium display.

## Prerequisites

- **Node.js 22 or later** (required — the app uses the built-in `node:sqlite` module, which isn't available in earlier Node versions)

Check your version:
```bash
node -v
```

## Setup

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open the URL it prints (typically `http://localhost:5173`).

The SQLite database file is created automatically on first run at `data/chess-tournament.db` (gitignored — each environment gets its own fresh database).

## Usage

1. Go to **Players** and add a few players.
2. Go to **Tournaments**, create a tournament, and click into it.
3. Register players into the tournament from the dropdown.
4. Click **Generate Random Round** to randomly pair players and play a round — repeat for as many rounds as you like.
5. Check the **Final Rankings** section for live standings and the top-3 podium.

## Project Structure

```
src/
├── lib/
│   └── server/
│       ├── db.js                     # DB connection + schema setup
│       └── repositories/
│           ├── players.js            # Player CRUD
│           ├── tournaments.js        # Tournament CRUD
│           ├── tournament-players.js # Registering players into tournaments
│           └── matches.js            # Random pairing, match results, rankings
└── routes/
    ├── players/                      # Player management UI
    └── tournaments/
        ├── +page.svelte              # Tournament list / CRUD
        └── [id]/                     # Tournament detail: players, matches, rankings
```

## Building for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

This project uses `@sveltejs/adapter-auto`, which picks the right adapter automatically when deployed to platforms like Vercel, Netlify, or Cloudflare Pages.
