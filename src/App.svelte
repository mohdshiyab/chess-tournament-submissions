<script>
  import { onMount } from 'svelte';
  import { seedDatabaseIfEmpty } from './db/seedData.js';
  import Navbar from './components/common/Navbar.svelte';
  import Toast from './components/common/Toast.svelte';
  import Dashboard from './components/dashboard/Dashboard.svelte';
  import TournamentList from './components/tournaments/TournamentList.svelte';
  import TournamentDetails from './components/tournaments/TournamentDetails.svelte';
  import PlayerList from './components/players/PlayerList.svelte';
  import GlobalRankings from './components/rankings/GlobalRankings.svelte';

  let activeTab = 'dashboard'; // 'dashboard' | 'tournaments' | 'tournament-details' | 'players' | 'rankings'
  let selectedTournamentId = null;

  let dashboardRef;
  let tournamentListRef;
  let playerListRef;
  let rankingsRef;

  onMount(async () => {
    // Seed initial Grandmasters if database is newly initialized
    await seedDatabaseIfEmpty();
  });

  function handleTabChange(event) {
    activeTab = event.detail;
  }

  function handleSelectTournament(event) {
    selectedTournamentId = event.detail;
    activeTab = 'tournament-details';
  }

  function handleBackToTournaments() {
    activeTab = 'tournaments';
    selectedTournamentId = null;
    tournamentListRef?.loadTournaments();
  }

  function handleDataRefreshed() {
    dashboardRef?.loadDashboardData();
    tournamentListRef?.loadTournaments();
    playerListRef?.loadPlayers();
    rankingsRef?.loadData();
  }
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
  
  <!-- Global Top Navbar -->
  <Navbar
    {activeTab}
    on:tabChange={handleTabChange}
    on:dataRefreshed={handleDataRefreshed}
  />

  <!-- Main View Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    {#if activeTab === 'dashboard'}
      <Dashboard
        bind:this={dashboardRef}
        on:tabChange={handleTabChange}
        on:selectTournament={handleSelectTournament}
      />
    {:else if activeTab === 'tournaments'}
      <TournamentList
        bind:this={tournamentListRef}
        on:selectTournament={handleSelectTournament}
      />
    {:else if activeTab === 'tournament-details'}
      <TournamentDetails
        tournamentId={selectedTournamentId}
        on:back={handleBackToTournaments}
      />
    {:else if activeTab === 'players'}
      <PlayerList
        bind:this={playerListRef}
      />
    {:else if activeTab === 'rankings'}
      <GlobalRankings
        bind:this={rankingsRef}
      />
    {/if}
  </main>

  <!-- Global Footer -->
  <footer class="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-base">♟️</span>
        <span class="font-semibold text-slate-400">ChessArena Management System</span>
        <span>•</span>
        <span>Bytelogik Assignment Submission</span>
      </div>
      <div>
        <span>Built with <strong>Svelte + JavaScript + Dexie IndexedDB</strong></span>
      </div>
    </div>
  </footer>

  <!-- Floating Toast Notification System -->
  <Toast />

</div>
