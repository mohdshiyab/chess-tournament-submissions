<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { tournamentService, playerService, matchService } from '../../db/database.js';
  import { seedDatabaseIfEmpty } from '../../db/seedData.js';
  import { toast } from '../../utils/toastStore.js';
  import Badge from '../common/Badge.svelte';
  import {
    Trophy, Users, Swords, Activity, Plus, UserPlus, Sparkles,
    ArrowRight, Crown, Medal, TrendingUp, Flame
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  let totalTournaments = 0;
  let activeTournaments = [];
  let totalPlayers = 0;
  let totalMatches = 0;
  let topPlayers = [];
  let loading = true;

  onMount(async () => {
    await loadDashboardData();
  });

  export async function loadDashboardData() {
    loading = true;
    try {
      const tourneys = await tournamentService.getAll();
      totalTournaments = tourneys.length;
      activeTournaments = tourneys.filter(t => t.status === 'In Progress' || t.status === 'Upcoming').slice(0, 3);

      const players = await playerService.getAll();
      totalPlayers = players.length;
      topPlayers = players.slice(0, 5);

      // Total matches count
      let matchCount = 0;
      for (const t of tourneys) {
        const m = await matchService.getByTournament(t.id);
        matchCount += m.filter(item => item.status === 'Completed').length;
      }
      totalMatches = matchCount;
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function navigateTo(tab) {
    dispatch('tabChange', tab);
  }

  function selectTournament(tourneyId) {
    dispatch('selectTournament', tourneyId);
  }

  async function handleQuickSeed() {
    await seedDatabaseIfEmpty();
    toast.success('Loaded top Grandmasters and sample tournament!');
    await loadDashboardData();
  }
</script>

<div class="space-y-8">
  
  <!-- Hero Section Banner -->
  <div class="relative p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950/60 border border-slate-800 shadow-2xl overflow-hidden">
    <div class="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none pointer-events-none">
      ♟️
    </div>

    <div class="relative z-10 max-w-3xl space-y-3">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
        <Sparkles class="w-3.5 h-3.5" />
        Official Bytelogik Assignment Suite
      </div>

      <h1 class="text-3xl sm:text-4xl font-black text-white leading-tight">
        Chess Tournament <span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-indigo-400">Management & Match Engine</span>
      </h1>

      <p class="text-sm text-slate-300 leading-relaxed">
        Complete end-to-end tournament lifecycle: Player CRUD, tournament scheduling, random matchmaking, automated match simulation, and dynamic 1st/2nd/3rd place podium rankings.
      </p>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 pt-2">
        <button
          on:click={() => navigateTo('tournaments')}
          class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Trophy class="w-4 h-4" />
          Explore Tournaments
        </button>

        <button
          on:click={() => navigateTo('players')}
          class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
        >
          <Users class="w-4 h-4" />
          Manage Players
        </button>

        {#if totalPlayers === 0}
          <button
            on:click={handleQuickSeed}
            class="flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-sm rounded-xl border border-amber-500/40 transition-all"
          >
            <Sparkles class="w-4 h-4" />
            Seed Sample Data
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Metric Statistics Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Stat 1: Total Tournaments -->
    <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tournaments</span>
        <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Trophy class="w-5 h-5" />
        </div>
      </div>
      <div class="text-3xl font-black text-white">{totalTournaments}</div>
      <div class="text-xs text-slate-500 mt-1">Organized events</div>
    </div>

    <!-- Stat 2: Active Tournaments -->
    <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
        <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400">
          <Activity class="w-5 h-5" />
        </div>
      </div>
      <div class="text-3xl font-black text-amber-400">{activeTournaments.length}</div>
      <div class="text-xs text-slate-500 mt-1">Live active arenas</div>
    </div>

    <!-- Stat 3: Total Players -->
    <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Grandmasters</span>
        <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400">
          <Users class="w-5 h-5" />
        </div>
      </div>
      <div class="text-3xl font-black text-white">{totalPlayers}</div>
      <div class="text-xs text-slate-500 mt-1">Registered in database</div>
    </div>

    <!-- Stat 4: Completed Matches -->
    <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Matches Simulated</span>
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Swords class="w-5 h-5" />
        </div>
      </div>
      <div class="text-3xl font-black text-emerald-400">{totalMatches}</div>
      <div class="text-xs text-slate-500 mt-1">Random engine outcomes</div>
    </div>
  </div>

  <!-- 2-Column Split: Active Tournaments & Top Rated Players -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- Left: Active Tournaments Spotlight (7 Cols) -->
    <div class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Flame class="w-5 h-5 text-amber-400" />
          Active & Upcoming Arenas
        </h3>
        <button
          on:click={() => navigateTo('tournaments')}
          class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      {#if activeTournaments.length === 0}
        <div class="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Trophy class="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p class="text-sm text-slate-400">No active tournaments found.</p>
          <button
            on:click={() => navigateTo('tournaments')}
            class="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            Create Tournament
          </button>
        </div>
      {:else}
        <div class="space-y-3">
          {#each activeTournaments as t (t.id)}
            <button
              type="button"
              on:click={() => selectTournament(t.id)}
              class="w-full text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel glass-panel-hover cursor-pointer flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <Badge
                    variant={t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {t.status}
                  </Badge>
                  <span class="text-xs text-slate-400">{t.format || 'Knockout'}</span>
                </div>
                <h4 class="font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {t.name}
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">Capacity: {t.maxPlayers || 8} players</p>
              </div>

              <div class="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight class="w-4 h-4" />
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Right: Top Rated Leaderboard Spotlight (5 Cols) -->
    <div class="lg:col-span-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Crown class="w-5 h-5 text-amber-400" />
          Top Grandmasters
        </h3>
        <button
          on:click={() => navigateTo('players')}
          class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel space-y-3">
        {#if topPlayers.length === 0}
          <div class="text-center py-6 text-slate-500 text-xs">
            No players in database yet.
          </div>
        {:else}
          {#each topPlayers as p, idx (p.id)}
            <div class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div class="flex items-center gap-3">
                <span class="w-5 text-center text-xs font-black {idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}">
                  {idx + 1}
                </span>
                <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">
                  {p.avatar || '♟️'}
                </div>
                <div>
                  <div class="font-bold text-xs text-white flex items-center gap-1">
                    {p.name}
                    {#if idx === 0}
                      <Crown class="w-3 h-3 text-amber-400" />
                    {/if}
                  </div>
                  <div class="text-[10px] text-slate-400">{p.country || 'International'}</div>
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-black text-amber-400">{p.rating || 1500}</span>
                <div class="text-[9px] text-slate-500 font-semibold">{p.wins || 0} Wins</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div>
</div>
