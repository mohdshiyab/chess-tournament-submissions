<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '../common/Modal.svelte';
  import { UserPlus, Edit3 } from 'lucide-svelte';

  export let isOpen = false;
  export let playerToEdit = null;

  const dispatch = createEventDispatcher();

  const AVATARS = ['👑', '⚡', '🎯', '🔥', '🚀', '🛡️', '⚔️', '♟️', '🐴', '🏰', '🧙', '🌟'];
  const TITLES = ['GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'Amateur'];

  let name = '';
  let rating = 1500;
  let title = 'Amateur';
  let country = 'International';
  let avatar = '♟️';
  let bio = '';
  let errors = {};

  $: isEditing = !!playerToEdit;

  $: if (isOpen) {
    if (playerToEdit) {
      name = playerToEdit.name;
      rating = playerToEdit.rating || 1500;
      title = playerToEdit.title || 'Amateur';
      country = playerToEdit.country || 'International';
      avatar = playerToEdit.avatar || '♟️';
      bio = playerToEdit.bio || '';
    } else {
      name = '';
      rating = 1500;
      title = 'Amateur';
      country = 'International';
      avatar = '♟️';
      bio = '';
    }
    errors = {};
  }

  function validate() {
    errors = {};
    if (!name.trim()) {
      errors.name = 'Player name is required';
    }
    if (isNaN(rating) || rating < 100 || rating > 3500) {
      errors.rating = 'Rating must be between 100 and 3500';
    }
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      rating: Number(rating),
      title,
      country: country.trim() || 'International',
      avatar,
      bio: bio.trim()
    };

    if (isEditing) {
      dispatch('save', { id: playerToEdit.id, ...payload });
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
  title={isEditing ? 'Edit Player Profile' : 'Register New Player'}
  on:close={close}
>
  <svelte:fragment slot="header-icon">
    {#if isEditing}
      <Edit3 class="w-5 h-5 text-indigo-400" />
    {:else}
      <UserPlus class="w-5 h-5 text-indigo-400" />
    {/if}
  </svelte:fragment>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Name -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="player-name">
        Player Full Name *
      </label>
      <input
        id="player-name"
        type="text"
        bind:value={name}
        placeholder="e.g. Viswanathan Anand"
        class="w-full bg-slate-950 border {errors.name ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
      />
      {#if errors.name}
        <p class="text-xs text-rose-400 mt-1">{errors.name}</p>
      {/if}
    </div>

    <!-- Rating & Title -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="player-rating">
          Elo / FIDE Rating *
        </label>
        <input
          id="player-rating"
          type="number"
          bind:value={rating}
          min="100"
          max="3500"
          class="w-full bg-slate-950 border {errors.rating ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {#if errors.rating}
          <p class="text-xs text-rose-400 mt-1">{errors.rating}</p>
        {/if}
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="player-title">
          Title
        </label>
        <select
          id="player-title"
          bind:value={title}
          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          {#each TITLES as t}
            <option value={t}>{t}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Country & Flag -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="player-country">
        Country / Federation
      </label>
      <input
        id="player-country"
        type="text"
        bind:value={country}
        placeholder="e.g. India, Norway, USA"
        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
      />
    </div>

    <!-- Avatar Picker -->
    <div>
      <span class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
        Chess Piece / Avatar
      </span>
      <div class="grid grid-cols-6 gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
        {#each AVATARS as av}
          <button
            type="button"
            class="h-10 text-xl rounded-lg flex items-center justify-center transition-all {avatar === av ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-600/40 border border-indigo-400' : 'hover:bg-slate-800'}"
            on:click={() => avatar = av}
          >
            {av}
          </button>
        {/each}
      </div>
    </div>

    <!-- Bio -->
    <div>
      <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" for="player-bio">
        Bio / Notes
      </label>
      <textarea
        id="player-bio"
        bind:value={bio}
        rows="2"
        placeholder="Short description or playing style..."
        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
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
      {isEditing ? 'Save Changes' : 'Create Player'}
    </button>
  </svelte:fragment>
</Modal>
