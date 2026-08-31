<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Modal from '../common/Modal.svelte';
  import Badge from '../common/Badge.svelte';
  import { playerService, tournamentService } from '../../db/database.js';
  import { toast } from '../../utils/toastStore.js';
  import { Users, UserPlus, UserMinus, Search, Check, AlertCircle } from 'lucide-svelte';

  export let isOpen = false;
  export let tournament = null;

  const dispatch = createEventDispatcher();

  let allPlayers = [];
  let registeredPlayerIds = new Set();
  let searchQuery = '';
  let loading = true;

  $: if (isOpen && tournament) {
    loadRosterData();
  }

  async function loadRosterData() {
    loading = true;
    try {
      allPlayers = await playerService.getAll();
      const registered = await tournamentService.getRegisteredPlayers(tournament.id);
      registeredPlayerIds = new Set(registered.map(p => p.id));
    } catch (err) {
      toast.error('Failed to load roster data');
    } finally {
      loading = false;
    }
  }

  $: filteredPlayers = allPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.country && p.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  async function togglePlayer(player) {
    if (!tournament) return;

    const isRegistered = registeredPlayerIds.has(player.id);

    try {
      if (isRegistered) {
        await tournamentService.removePlayerFromTournament(tournament.id, player.id);
        registeredPlayerIds.delete(player.id);
        registeredPlayerIds = new Set(registeredPlayerIds);
        toast.info(`Removed ${player.name} from tournament`);
      } else {
        if (registeredPlayerIds.size >= (tournament.maxPlayers || 8)) {
          toast.warning(`Tournament capacity reached (${tournament.maxPlayers} players maximum)`);
          return;
        }
        await tournamentService.addPlayerToTournament(tournament.id, player.id);
        registeredPlayerIds.add(player.id);
        registeredPlayerIds = new Set(registeredPlayerIds);
        toast.success(`Added ${player.name} to tournament`);
      }
      dispatch('rosterUpdated');
    } catch (err) {
      toast.error(err.message || 'Error updating tournament roster');
    }
  }

  function close() {
    dispatch('close');
  }
</script>

{#if tournament}
  <Modal
    isOpen={isOpen}
    title="Manage Tournament Roster"
    on:close={close}
    maxWidth="max-w-2xl"
  >
    <svelte:fragment slot="header-icon">
      <Users class="w-5 h-5 text-indigo-400" />
    </svelte:fragment>

    <div class="space-y-4">
      <!-- Tournament Info Bar -->
      <div class="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
        <div>
          <span class="text-slate-400 font-medium">Tournament:</span>
          <strong class="text-white ml-1 font-bold">{tournament.name}</strong>
        </div>
        <div class="flex items-center gap-2 font-semibold">
          <span class="text-slate-400">Registered:</span>
          <span class="px-2 py-0.5 rounded-md {registeredPlayerIds.size >= (tournament.maxPlayers || 8) ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">
            {registeredPlayerIds.size} / {tournament.maxPlayers || 8}
          </span>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Filter registered and available players..."
          class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
        />
      </div>

      <!-- Player List Grid -->
      {#if loading}
        <div class="text-center py-10 text-slate-400 text-xs">Loading players...</div>
      {:else if filteredPlayers.length === 0}
        <div class="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          No players available. Add players in the Players tab first!
        </div>
      {:else}
        <div class="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {#each filteredPlayers as p (p.id)}
            {@const isSelected = registeredPlayerIds.has(p.id)}
            <div
              class="flex items-center justify-between p-3 rounded-xl border transition-all {isSelected ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm' : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'}"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                  {p.avatar || '♟️'}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-white">{p.name}</span>
                    <Badge variant={p.title ? p.title.toLowerCase() : 'default'} size="sm">
                      {p.title || 'Amateur'}
                    </Badge>
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{p.country || 'International'}</span>
                    <span>•</span>
                    <span class="text-amber-400 font-semibold">{p.rating || 1500} Elo</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                on:click={() => togglePlayer(p)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {isSelected ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'}"
              >
                {#if isSelected}
                  <UserMinus class="w-3.5 h-3.5" />
                  Remove
                {:else}
                  <UserPlus class="w-3.5 h-3.5" />
                  Add to Roster
                {/if}
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <svelte:fragment slot="footer">
      <button
        type="button"
        on:click={close}
        class="px-5 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
      >
        Done
      </button>
    </svelte:fragment>
  </Modal>
{/if}
