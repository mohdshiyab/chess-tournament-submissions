<script>
  import { createEventDispatcher } from 'svelte';
  import { Trophy, Users, LayoutDashboard, Medal, RotateCcw, Sparkles } from 'lucide-svelte';
  import { resetDatabase, seedDatabaseIfEmpty } from '../../db/seedData.js';
  import { toast } from '../../utils/toastStore.js';

  export let activeTab = 'dashboard';

  const dispatch = createEventDispatcher();

  function selectTab(tab) {
    activeTab = tab;
    dispatch('tabChange', tab);
  }

  async function handleResetData() {
    if (confirm('Are you sure you want to reset all tournament and player data to defaults?')) {
      await resetDatabase();
      toast.success('Database reset to default grandmaster roster!');
      dispatch('dataRefreshed');
    }
  }

  async function handleLoadSampleData() {
    await seedDatabaseIfEmpty();
    toast.success('Grandmaster roster and sample tournaments loaded!');
    dispatch('dataRefreshed');
  }
</script>

<header class="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      
      <!-- Brand Logo -->
      <button
        type="button"
        class="flex items-center gap-3 cursor-pointer text-left focus:outline-none"
        on:click={() => selectTab('dashboard')}
      >
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
          ♟️
        </div>
        <div>
          <span class="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            ChessArena
          </span>
          <span class="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Pro
          </span>
        </div>
      </button>

      <!-- Navigation Tabs -->
      <nav class="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all {activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}"
          on:click={() => selectTab('dashboard')}
        >
          <LayoutDashboard class="w-4 h-4" />
          Dashboard
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all {activeTab === 'tournaments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}"
          on:click={() => selectTab('tournaments')}
        >
          <Trophy class="w-4 h-4" />
          Tournaments
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all {activeTab === 'players' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}"
          on:click={() => selectTab('players')}
        >
          <Users class="w-4 h-4" />
          Players
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all {activeTab === 'rankings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}"
          on:click={() => selectTab('rankings')}
        >
          <Medal class="w-4 h-4" />
          Rankings & Podium
        </button>
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          on:click={handleLoadSampleData}
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/40 transition-colors"
          title="Seed sample Grandmasters and tournaments"
        >
          <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
          Seed Demo
        </button>

        <button
          on:click={handleResetData}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Reset database to initial state"
        >
          <RotateCcw class="w-3.5 h-3.5 text-slate-400" />
          Reset
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile Navigation Bar -->
  <div class="md:hidden flex items-center justify-around py-2 px-2 bg-slate-950 border-t border-slate-800">
    <button
      class="flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium {activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}"
      on:click={() => selectTab('dashboard')}
    >
      <LayoutDashboard class="w-4 h-4" />
      <span>Dashboard</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium {activeTab === 'tournaments' ? 'text-indigo-400' : 'text-slate-400'}"
      on:click={() => selectTab('tournaments')}
    >
      <Trophy class="w-4 h-4" />
      <span>Tourneys</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium {activeTab === 'players' ? 'text-indigo-400' : 'text-slate-400'}"
      on:click={() => selectTab('players')}
    >
      <Users class="w-4 h-4" />
      <span>Players</span>
    </button>
    <button
      class="flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium {activeTab === 'rankings' ? 'text-indigo-400' : 'text-slate-400'}"
      on:click={() => selectTab('rankings')}
    >
      <Medal class="w-4 h-4" />
      <span>Rankings</span>
    </button>
  </div>
</header>
