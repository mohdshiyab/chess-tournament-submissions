# ♟️ ChessArena - Chess Tournament Management System

> **Candidate Technical Assignment Submission for Bytelogik**  
> **Candidate Name:** Mohammad Shiyabuddeen  
> **Email:** shihabputtur2@gmail.com  
> **Tech Stack:** Option 2 — **Svelte**, **JavaScript**, **Vite**, **Tailwind CSS**, and **Dexie.js (IndexedDB Database)**.

---

## 🌟 Live Demo & Deployment

- **Live Website Application**: [https://chess-tournament-submissions-phi.vercel.app/](https://chess-tournament-submissions-phi.vercel.app/)
- **Pull Request Submission**: [Pull Request #78](https://github.com/Kevindodiya75/chess-tournament-submissions/pull/78)
- **Resume Attachment:**[Mohammad_Shiyabuddeen_Resume.pdf](https://github.com/user-attachments/files/31638043/Mohammad_Shiyabuddeen_Resume.pdf)

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
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/mohdshiyab/chess-tournament-submissions.git
   cd chess-tournament-submissions
