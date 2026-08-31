# ♟️ ChessArena - Chess Tournament Management System

> **Candidate Technical Assignment Submission for Bytelogik**  
> Built with **Svelte**, **JavaScript**, **Vite**, **Tailwind CSS**, and **Dexie.js (IndexedDB Database)**.

---

## 🌟 Live Demo & Preview

- **Live Website Demo**: [Deploy with Vercel / Netlify / GitHub Pages]
- **Video Walkthrough**: Complete workflow demonstration covering Player CRUD, Tournament CRUD, Random Match Pairings, Match Simulation, and Top-3 Podium Rankings.

---

## 📋 Feature Breakdown

### 1. 👥 Player Management (CRUD)
- **Create**: Add players with Name, Elo / FIDE Rating (100–3500), Official Title (`GM`, `IM`, `FM`, `CM`, `WGM`, `Amateur`), Country / Federation, Avatar icon, and Bio notes.
- **Read**: Fast searchable and filterable player table with sorting by Rating (High/Low), Name (A–Z), and Career Wins. Detailed player profile modal with career stats (Win Rate %, Total Points, W-D-L ratio visual bar).
- **Update**: Edit existing player metadata, ratings, or biographical details anytime.
- **Delete**: Remove players with cascade cleanup across tournament rosters and match records.
- **Sample Roster Seeder**: 1-click **Seed Demo** button to populate the database with world-renowned Grandmasters (*Magnus Carlsen, Hikaru Nakamura, Gukesh D, Praggnanandhaa, Fabiano Caruana, Alireza Firouzja, Ding Liren, Ian Nepomniachtchi*).

### 2. 🏆 Tournament Management (CRUD & Roster)
- **Create**: Setup new tournaments with Name, Format (*Knockout, Single Elimination, Swiss System, Round Robin*), Status (*Upcoming, In Progress, Completed*), Player Capacity (2–64), and Start/End Dates.
- **Read**: Tournament hub with real-time status badges, capacity progress indicators, search/filter controls, and arena views.
- **Update**: Edit tournament parameters, schedules, and lifecycle status.
- **Delete**: Cascade deletion of tournament records and related match history.
- **Roster Management**: Interactive player selector modal allowing tournament organizers to register and remove players dynamically while enforcing capacity limits.

### 3. ⚔️ Random Match Pairing & Simulation Engine
- **Random Match Pairing**: Implements a **Fisher-Yates shuffle algorithm** to pair registered players into White vs Black brackets randomly. Supports BYE handling for odd player counts.
- **Match Simulation**:
  - **Single Match Simulation**: Simulates individual matches randomly, determining White Win (`1-0`), Black Win (`0-1`), or Classical Draw (`½-½` with tiebreak resolution) while updating player career statistics.
  - **Simulate Current Round**: One-click batch simulation of all scheduled matches in the active round, automatically generating the next round pairings.
  - **Fast Sim Entire Tournament**: Fully automated round-by-round simulation from Round 1 through Quarter-Finals, Semi-Finals, and Grand Finals.
  - **Director Result Override**: Manual score buttons (`1-0`, `½-½`, `0-1`) for tournament administrators.

### 4. 🥇 Championship Rankings & 3D Podium
- **1st, 2nd, 3rd Place Podium**: Visual 3D gold, silver, and bronze podium highlighting the Champion, Runner-up, and 3rd Place Playoff winner with celebratory confetti animations (`canvas-confetti`).
- **Complete Standings Table**: Official FIDE points system (`Win = 1.0`, `Draw = 0.5`, `Loss = 0.0`), Matches Played (MP), Wins (W), Draws (D), Losses (L), Total Points, and tournament finishing tier.

### 5. 💾 Database Persistence
- **Client-Side Relational Database**: Powered by **Dexie.js (IndexedDB)** with indexed relational tables (`players`, `tournaments`, `tournament_players`, `matches`).
- Zero backend configuration required — data persists locally across page reloads and browser sessions.
- Built-in **Reset Database** and **Seed Demo** tools.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Svelte](https://svelte.dev/) (Option 2) |
| **Language** | JavaScript (ES6+ / Modern JS) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Custom Chess Dark Theme |
| **Database** | [Dexie.js](https://dexie.org/) (IndexedDB Wrapper) |
| **Icons** | [Lucide Svelte](https://lucide.dev/) |
| **Celebrations**| [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chess-tournament-submissions.git
   cd chess-tournament-submissions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build locally:
   ```bash
   npm run preview
   ```

---

## 🌐 Instant Live Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Vercel will auto-detect Vite and deploy the live site in under 30 seconds.

### Deploy to GitHub Pages
1. In `vite.config.js`, set `base: './'`.
2. Run `npm run build`.
3. Deploy the `dist` folder to GitHub Pages.

---

## 📂 Project Architecture

```
chess-tournament-system/
├── public/
│   └── favicon.svg                # Chess SVG logo
├── src/
│   ├── main.js                    # Svelte root mount
│   ├── App.svelte                 # Main layout & navigation container
│   ├── app.css                    # Tailwind CSS & glassmorphism theme
│   ├── db/
│   │   ├── database.js            # Dexie.js IndexedDB schema & CRUD services
│   │   └── seedData.js            # Default Grandmasters & sample tournaments
│   ├── services/
│   │   ├── pairingService.js      # Fisher-Yates random matchmaking & bracket engine
│   │   ├── simulationService.js   # Match outcome, round & full tournament simulation
│   │   └── rankingService.js      # FIDE points calculation & top-3 podium resolver
│   ├── utils/
│   │   └── toastStore.js          # Reactive notification toast store
│   └── components/
│       ├── common/
│       │   ├── Navbar.svelte      # Responsive header & database controls
│       │   ├── Modal.svelte       # Accessible reusable modal dialog
│       │   ├── Badge.svelte       # Status & chess title badges
│       │   ├── Toast.svelte       # Floating alert toasts
│       │   └── Confetti.svelte    # Celebration confetti generator
│       ├── dashboard/
│       │   └── Dashboard.svelte   # Overview metrics, active arenas & leaderboard
│       ├── players/
│       │   ├── PlayerList.svelte  # Searchable player CRUD table
│       │   ├── PlayerFormModal.svelte    # Create/Edit player profile form
│       │   └── PlayerDetailsModal.svelte # Career stats & W-D-L visual bar
│       ├── tournaments/
│       │   ├── TournamentList.svelte     # Tournament dashboard & CRUD cards
│       │   ├── TournamentFormModal.svelte # Tournament creation/edit form
│       │   ├── TournamentDetails.svelte  # Match arena, rounds & live bracket
│       │   └── PlayerSelectorModal.svelte # Roster manager & player registration
│       ├── matches/
│       │   └── MatchCard.svelte   # Match card with White/Black piece badges & simulator
│       └── rankings/
│           ├── Podium.svelte      # 3D Gold, Silver, Bronze podium
│           ├── StandingsTable.svelte     # Full tournament standings table
│           └── GlobalRankings.svelte     # Multi-tournament ranking explorer
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## 📜 Git Commit Log (Angular Convention)

This project strictly adheres to the **Angular Commit Message Convention**:
- `chore: initial project setup with svelte, vite, tailwind css, and dependencies`
- `feat(db): implement indexeddb database schema and seed data with dexie.js`
- `feat(engine): implement random match pairing, simulation service, and ranking algorithms`
- `feat(ui): create responsive chess-themed tournament and player management interface`
- `feat(rankings): implement 3d podium with 1st 2nd 3rd rankings and confetti celebration`
- `docs: add comprehensive assignment documentation, setup guide, and deployment instructions`

---

## 📄 License & Attribution
Created for the **Bytelogik Software Developer Technical Evaluation**.
