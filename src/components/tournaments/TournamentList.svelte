<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { tournamentService } from '../../db/database.js';
  import { toast } from '../../utils/toastStore.js';
  import TournamentFormModal from './TournamentFormModal.svelte';
  import Badge from '../common/Badge.svelte';
  import {
    Trophy, Plus, Search, Calendar, Users, Swords, ArrowRight,
    Edit3, Trash2, Filter, Play, CheckCircle
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  let tournaments = [];
  let loading = true;
  let searchQuery = '';
  let selectedStatus = 'All';
  let isFormOpen = false;
  let tournamentToEdit = null;

  onMount(async () => {
    await loadTournaments();
  });

  export async function loadTournaments() {
    loading = true;
    try {
      const allTourneys = await tournamentService.getAll();
      
      // Enrich with registered player counts
      const enriched = await Promise.all(
        allTourneys.map(async t => {
          const players = await tournamentService.getRegisteredPlayers(t.id);
          return {
            ...t,
            registeredCount: players.length
          };
        })
      );
      tournaments = enriched;
    } catch (err) {
      toast.error('Failed to load tournaments');
    } finally {
      loading = false;
    }
  }

  $: filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.format && t.format.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  function openCreateModal() {
    tournamentToEdit = null;
    isFormOpen = true;
  }

  function openEditModal(t, e) {
    e?.stopPropagation();
    tournamentToEdit = t;
    isFormOpen = true;
  }

  function selectTournament(t) {
    dispatch('selectTournament', t.id);
  }

  async function handleSaveTournament(event) {
    const data = event.detail;
    try {
      if (data.id) {
        await tournamentService.update(data.id, data);
        toast.success(`Updated tournament ${data.name}`);
      } else {
        const newId = await tournamentService.create(data);
        toast.success(`Created tournament ${data.name}`);
      }
      isFormOpen = false;
      await loadTournaments();
    } catch (err) {
      toast.error('Failed to save tournament');
    }
  }

  async function handleDeleteTournament(t, e) {
    e?.stopPropagation();
    if (confirm(`Are you sure you want to delete ${t.name}?`)) {
      try {
        await tournamentService.delete(t.id);
        toast.success(`Deleted ${t.name}`);
        await loadTournaments();
      } catch (err) {
        toast.error('Failed to delete tournament');
      }
    }
  }
</script>

<div class="space-y-6">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-black text-white flex items-center gap-2.5">
        <Trophy class="w-7 h-7 text-indigo-400" />
        Tournament Management
      </h2>
      <p class="text-sm text-slate-400 mt-0.5">
        Create, organize, register players, and execute chess tournaments.
      </p>
    </div>

    <button
      on:click={openCreateModal}
      class="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
    >
      <Plus class="w-5 h-5" />
      Create Tournament
    </button>
  </div>

  <!-- Filter & Search Controls -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-md">
    <div class="relative sm:col-span-2">
      <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search tournaments by title or format..."
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
      />
    </div>

    <div class="flex items-center gap-2">
      <Filter class="w-4 h-4 text-slate-500 shrink-0" />
      <select
        bind:value={selectedStatus}
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="All">All Statuses</option>
        <option value="Upcoming">Upcoming</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
  </div>

  <!-- Tournament Grid -->
  {#if loading}
    <div class="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm">Loading tournaments...</p>
    </div>
  {:else if filteredTournaments.length === 0}
    <div class="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
      <div class="text-4xl mb-3">🏆</div>
      <h3 class="text-lg font-bold text-white mb-1">No Tournaments Found</h3>
      <p class="text-sm text-slate-400 max-w-sm mx-auto mb-5">
        {searchQuery ? 'No tournaments match your filter.' : 'Create your first chess tournament or load sample data from the top bar!'}
      </p>
      {#if !searchQuery}
        <button
          on:click={openCreateModal}
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          Create Tournament
        </button>
      {/if}
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each filteredTournaments as t (t.id)}
        <div
          role="button"
          tabindex="0"
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectTournament(t)}
          class="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel glass-panel-hover cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          on:click={() => selectTournament(t)}
        >
          <div>
            <!-- Top Status & Format Row -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <Badge
                variant={t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'warning' : 'info'}
                size="sm"
              >
                {t.status}
              </Badge>
              <span class="text-xs font-semibold text-slate-400 px-2 py-0.5 bg-slate-950 rounded-md border border-slate-800">
                {t.format || 'Knockout'}
              </span>
            </div>

            <!-- Tournament Name -->
            <h3 class="text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors mb-2">
              {t.name}
            </h3>

            {#if t.description}
              <p class="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {t.description}
              </p>
            {/if}

            <!-- Metadata Pills -->
            <div class="space-y-2 mb-4">
              <!-- Player Capacity Progress -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-slate-400 flex items-center gap-1">
                    <Users class="w-3.5 h-3.5 text-indigo-400" />
                    Registered Roster
                  </span>
                  <strong class="text-slate-200">{t.registeredCount} / {t.maxPlayers || 8}</strong>
                </div>
                <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-500 rounded-full transition-all"
                    style="width: {Math.min(100, (t.registeredCount / (t.maxPlayers || 8)) * 100)}%"
                  ></div>
                </div>
              </div>

              <!-- Start Date -->
              <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar class="w-3.5 h-3.5" />
                <span>Starts: {t.startDate || 'TBD'}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
            <div class="flex items-center gap-1">
              <button
                on:click={(e) => openEditModal(t, e)}
                class="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Tournament"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                on:click={(e) => handleDeleteTournament(t, e)}
                class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete Tournament"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <button
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white font-semibold text-xs rounded-xl border border-indigo-500/30 transition-all"
            >
              <span>Open Arena</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Edit / Create Modal -->
<TournamentFormModal
  isOpen={isFormOpen}
  {tournamentToEdit}
  on:close={() => isFormOpen = false}
  on:save={handleSaveTournament}
/>
