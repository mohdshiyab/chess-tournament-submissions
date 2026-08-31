<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '../common/Modal.svelte';
  import { Trophy, Edit3 } from 'lucide-svelte';

  export let isOpen = false;
  export let tournamentToEdit = null;

  const dispatch = createEventDispatcher();

  const FORMATS = ['Knockout', 'Single Elimination', 'Swiss System', 'Round Robin'];
  const STATUSES = ['Upcoming', 'In Progress', 'Completed'];

  let name = '';
  let format = 'Knockout';
  let status = 'Upcoming';
  let maxPlayers = 8;
  let startDate = new Date().toISOString().split('T')[0];
  let endDate = '';
  let description = '';
  let errors = {};

  $: isEditing = !!tournamentToEdit;

  $: if (isOpen) {
    if (tournamentToEdit) {
      name = tournamentToEdit.name;
      format = tournamentToEdit.format || 'Knockout';
      status = tournamentToEdit.status || 'Upcoming';
      maxPlayers = tournamentToEdit.maxPlayers || 8;
      startDate = tournamentToEdit.startDate || '';
      endDate = tournamentToEdit.endDate || '';
      description = tournamentToEdit.description || '';
    } else {
      name = '';
      format = 'Knockout';
      status = 'Upcoming';
      maxPlayers = 8;
      startDate = new Date().toISOString().split('T')[0];
      endDate = '';
      description = '';
    }
    errors = {};
  }

  function validate() {
    errors = {};
    if (!name.trim()) {
      errors.name = 'Tournament name is required';
    }
    if (isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 64) {
      errors.maxPlayers = 'Max players must be between 2 and 64';
    }
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      format,
      status,
      maxPlayers: Number(maxPlayers),
      startDate,
      endDate,
      description: description.trim()
    };

    if (isEditing) {
      dispatch('save', { id: tournamentToEdit.id, ...payload });
    } else {
      dispatch('save', payload);
    }
  }

  function close() {
    dispatch('close');
  }
</script>

<Modal
  isOpen={isOpen}
  title={isEditing ? 'Edit Tournament Settings' : 'Create New Tournament'}
  on:close={close}
>
  <svelte:fragment slot="header-icon">
    {#if isEditing}
      <Edit3 class="w-5 h-5 text-indigo-400" />
    {:else}
      <Trophy class="w-5 h-5 text-indigo-400" />
    {/if}
  </svelte:fragment>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Tournament Name -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-name">
        Tournament Name *
      </label>
      <input
        id="tourney-name"
        type="text"
        bind:value={name}
        placeholder="e.g. World Chess Championship 2026"
        class="w-full bg-slate-950 border {errors.name ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
      />
      {#if errors.name}
        <p class="text-xs text-rose-400 mt-1">{errors.name}</p>
      {/if}
    </div>

    <!-- Format & Capacity -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-format">
          Tournament Format
        </label>
        <select
          id="tourney-format"
          bind:value={format}
          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {#each FORMATS as f}
            <option value={f}>{f}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-capacity">
          Player Capacity *
        </label>
        <input
          id="tourney-capacity"
          type="number"
          bind:value={maxPlayers}
          min="2"
          max="64"
          class="w-full bg-slate-950 border {errors.maxPlayers ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {#if errors.maxPlayers}
          <p class="text-xs text-rose-400 mt-1">{errors.maxPlayers}</p>
        {/if}
      </div>
    </div>

    <!-- Status & Dates -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-status">
          Status
        </label>
        <select
          id="tourney-status"
          bind:value={status}
          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {#each STATUSES as s}
            <option value={s}>{s}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-start">
          Start Date
        </label>
        <input
          id="tourney-start"
          type="date"
          bind:value={startDate}
          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="tourney-desc">
        Description
      </label>
      <textarea
        id="tourney-desc"
        bind:value={description}
        rows="2"
        placeholder="Tournament rules, venue, or prize pool notes..."
        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
      ></textarea>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <button
      type="button"
      on:click={close}
      class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
    >
      Cancel
    </button>
    <button
      type="button"
      on:click={handleSubmit}
      class="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
    >
      {isEditing ? 'Update Tournament' : 'Create Tournament'}
    </button>
  </svelte:fragment>
</Modal>
