<script>
  import { onMount } from 'svelte';
  import { playerService } from '../../db/database.js';
  import { toast } from '../../utils/toastStore.js';
  import PlayerFormModal from './PlayerFormModal.svelte';
  import PlayerDetailsModal from './PlayerDetailsModal.svelte';
  import Badge from '../common/Badge.svelte';
  import {
    Users, UserPlus, Search, ArrowUpDown, Edit3, Trash2, Eye,
    Trophy, Globe, Sparkles, Filter
  } from 'lucide-svelte';

  let players = [];
  let loading = true;
  let searchQuery = '';
  let selectedTitle = 'All';
  let sortBy = 'rating_desc'; // 'rating_desc', 'rating_asc', 'name_asc', 'wins_desc'

  let isFormOpen = false;
  let isDetailsOpen = false;
  let playerToEdit = null;
  let playerToView = null;

  onMount(async () => {
    await loadPlayers();
  });

  export async function loadPlayers() {
    loading = true;
    try {
      players = await playerService.getAll();
    } catch (err) {
      toast.error('Failed to load players');
    } finally {
      loading = false;
    }
  }

  // Filtered & Sorted Players
  $: filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.country && p.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTitle = selectedTitle === 'All' || p.title === selectedTitle;
    return matchesSearch && matchesTitle;
  }).sort((a, b) => {
    if (sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'rating_asc') return (a.rating || 0) - (b.rating || 0);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'wins_desc') return (b.wins || 0) - (a.wins || 0);
    return 0;
  });

  function openCreateModal() {
    playerToEdit = null;
    isFormOpen = true;
  }

  function openEditModal(player) {
    playerToEdit = player;
    isFormOpen = true;
  }

  function openViewModal(player) {
    playerToView = player;
    isDetailsOpen = true;
  }

  async function handleSavePlayer(event) {
    const data = event.detail;
    try {
      if (data.id) {
        await playerService.update(data.id, data);
        toast.success(`Updated player ${data.name}`);
      } else {
        await playerService.create(data);
        toast.success(`Registered new player ${data.name}`);
      }
      isFormOpen = false;
      await loadPlayers();
    } catch (err) {
      toast.error('Failed to save player');
    }
  }

  async function handleDeletePlayer(player) {
    if (confirm(`Are you sure you want to delete ${player.name}? This will also remove them from tournament rosters.`)) {
      try {
        await playerService.delete(player.id);
        toast.success(`Deleted ${player.name}`);
        await loadPlayers();
      } catch (err) {
        toast.error('Failed to delete player');
      }
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Action Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-black text-white flex items-center gap-2.5">
        <Users class="w-7 h-7 text-indigo-400" />
        Player Management
      </h2>
      <p class="text-sm text-slate-400 mt-0.5">
        Register, view, update, and manage chess players in the tournament database.
      </p>
    </div>

    <button
      on:click={openCreateModal}
      class="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
    >
      <UserPlus class="w-5 h-5" />
      Register Player
    </button>
  </div>

  <!-- Search & Filter Controls -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-md">
    <!-- Search Bar -->
    <div class="relative sm:col-span-1">
      <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search players, titles, country..."
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
      />
    </div>

    <!-- Title Filter -->
    <div class="flex items-center gap-2">
      <Filter class="w-4 h-4 text-slate-500 shrink-0" />
      <select
        bind:value={selectedTitle}
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="All">All Titles</option>
        <option value="GM">Grandmaster (GM)</option>
        <option value="IM">International Master (IM)</option>
        <option value="FM">FIDE Master (FM)</option>
        <option value="Amateur">Amateur</option>
      </select>
    </div>

    <!-- Sort By -->
    <div class="flex items-center gap-2">
      <ArrowUpDown class="w-4 h-4 text-slate-500 shrink-0" />
      <select
        bind:value={sortBy}
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="rating_desc">Highest Rating (Elo)</option>
        <option value="rating_asc">Lowest Rating (Elo)</option>
        <option value="wins_desc">Most Wins</option>
        <option value="name_asc">Name (A-Z)</option>
      </select>
    </div>
  </div>

  <!-- Players Table / Grid -->
  {#if loading}
    <div class="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm">Loading player roster...</p>
    </div>
  {:else if filteredPlayers.length === 0}
    <div class="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
      <div class="text-4xl mb-3">♟️</div>
      <h3 class="text-lg font-bold text-white mb-1">No Players Found</h3>
      <p class="text-sm text-slate-400 max-w-sm mx-auto mb-5">
        {searchQuery ? 'No players match your search filter.' : 'Your player database is empty. Register a player or load sample grandmasters.'}
      </p>
      {#if !searchQuery}
        <button
          on:click={openCreateModal}
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl"
        >
          Add Your First Player
        </button>
      {/if}
    </div>
  {:else}
    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-4">Player</th>
              <th class="py-3.5 px-4 text-center">Title</th>
              <th class="py-3.5 px-4 text-center">Rating</th>
              <th class="py-3.5 px-4 text-center hidden md:table-cell">Federation</th>
              <th class="py-3.5 px-4 text-center hidden sm:table-cell">Career Record (W-D-L)</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-sm">
            {#each filteredPlayers as p (p.id)}
              <tr class="hover:bg-slate-800/40 transition-colors group">
                <!-- Player Name & Avatar -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-700">
                      {p.avatar || '♟️'}
                    </div>
                    <div>
                      <div class="font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {p.name}
                      </div>
                      <div class="text-xs text-slate-500 md:hidden">
                        {p.country || 'International'}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Title Badge -->
                <td class="py-3.5 px-4 text-center">
                  <Badge variant={p.title ? p.title.toLowerCase() : 'default'} size="sm">
                    {p.title || 'Amateur'}
                  </Badge>
                </td>

                <!-- Rating -->
                <td class="py-3.5 px-4 text-center">
                  <span class="font-black text-amber-400 text-base">{p.rating || 1200}</span>
                </td>

                <!-- Federation -->
                <td class="py-3.5 px-4 text-center text-slate-400 hidden md:table-cell">
                  <span class="inline-flex items-center gap-1.5 text-xs">
                    <Globe class="w-3.5 h-3.5 text-slate-500" />
                    {p.country || 'International'}
                  </span>
                </td>

                <!-- Career Record (W-D-L) -->
                <td class="py-3.5 px-4 text-center hidden sm:table-cell">
                  <div class="inline-flex items-center gap-2 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span class="text-emerald-400">{p.wins || 0}W</span>
                    <span class="text-slate-500">/</span>
                    <span class="text-slate-400">{p.draws || 0}D</span>
                    <span class="text-slate-500">/</span>
                    <span class="text-rose-400">{p.losses || 0}L</span>
                  </div>
                </td>

                <!-- Action Buttons -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      on:click={() => openViewModal(p)}
                      class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="View Career Statistics"
                      aria-label="View player stats"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button
                      on:click={() => openEditModal(p)}
                      class="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      title="Edit Player Details"
                      aria-label="Edit player"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button
                      on:click={() => handleDeletePlayer(p)}
                      class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Player"
                      aria-label="Delete player"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Footer count -->
      <div class="px-4 py-3 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Showing <strong>{filteredPlayers.length}</strong> of <strong>{players.length}</strong> players</span>
        <span class="text-slate-500">IndexedDB Database Live Sync</span>
      </div>
    </div>
  {/if}
</div>

<!-- Modals -->
<PlayerFormModal
  isOpen={isFormOpen}
  playerToEdit={playerToEdit}
  on:close={() => isFormOpen = false}
  on:save={handleSavePlayer}
/>

<PlayerDetailsModal
  isOpen={isDetailsOpen}
  player={playerToView}
  on:close={() => isDetailsOpen = false}
/>
