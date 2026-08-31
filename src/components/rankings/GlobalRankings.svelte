<script>
  import { onMount } from 'svelte';
  import { tournamentService, playerService } from '../../db/database.js';
  import { getTournamentRankings } from '../../services/rankingService.js';
  import Podium from './Podium.svelte';
  import StandingsTable from './StandingsTable.svelte';
  import Badge from '../common/Badge.svelte';
  import { Trophy, Medal, Crown, Star, ChevronDown } from 'lucide-svelte';

  let tournaments = [];
  let selectedTournamentId = null;
  let podium = { first: null, second: null, third: null };
  let standings = [];
  let loading = true;

  onMount(async () => {
    await loadData();
  });

  export async function loadData() {
    loading = true;
    try {
      tournaments = await tournamentService.getAll();
      if (tournaments.length > 0) {
        // Default to the first completed tournament or first available
        const completed = tournaments.find(t => t.status === 'Completed');
        selectedTournamentId = completed ? completed.id : tournaments[0].id;
        await loadRankingsForTournament(selectedTournamentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function loadRankingsForTournament(tId) {
    if (!tId) return;
    try {
      const data = await getTournamentRankings(tId);
      podium = data.podium;
      standings = data.standings;
    } catch (err) {
      console.error(err);
    }
  }

  function handleTournamentChange(e) {
    selectedTournamentId = Number(e.target.value);
    loadRankingsForTournament(selectedTournamentId);
  }

  $: selectedTourney = tournaments.find(t => t.id === selectedTournamentId);
</script>

<div class="space-y-6">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-black text-white flex items-center gap-2.5">
        <Medal class="w-7 h-7 text-indigo-400" />
        Rankings & Championship Podium
      </h2>
      <p class="text-sm text-slate-400 mt-0.5">
        Inspect 1st, 2nd, 3rd place podium standings and points tables across tournaments.
      </p>
    </div>

    <!-- Tournament Selector Dropdown -->
    {#if tournaments.length > 0}
      <div class="relative min-w-[240px]">
        <select
          value={selectedTournamentId}
          on:change={handleTournamentChange}
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg appearance-none cursor-pointer pr-10"
        >
          {#each tournaments as t}
            <option value={t.id}>
              {t.name} ({t.status})
            </option>
          {/each}
        </select>
        <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm">Loading tournament rankings...</p>
    </div>
  {:else if tournaments.length === 0}
    <div class="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
      <Trophy class="w-10 h-10 text-slate-600 mx-auto mb-2" />
      <h3 class="text-lg font-bold text-white mb-1">No Tournaments Available</h3>
      <p class="text-sm text-slate-400 max-w-sm mx-auto">
        Create tournaments and simulate matches to view podium rankings.
      </p>
    </div>
  {:else}
    <div class="space-y-6">
      <!-- 3D Podium Component -->
      <Podium {podium} autoCelebrate={selectedTourney?.status === 'Completed'} />

      <!-- Full Standings Table -->
      <StandingsTable {standings} />
    </div>
  {/if}
</div>
