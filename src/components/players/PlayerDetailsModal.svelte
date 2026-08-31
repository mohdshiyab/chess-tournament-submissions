<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '../common/Modal.svelte';
  import Badge from '../common/Badge.svelte';
  import { Trophy, Swords, Award, TrendingUp, Globe, Calendar } from 'lucide-svelte';

  export let isOpen = false;
  export let player = null;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  $: totalGames = player ? (player.wins || 0) + (player.losses || 0) + (player.draws || 0) : 0;
  $: winRate = totalGames > 0 ? Math.round(((player.wins || 0) + 0.5 * (player.draws || 0)) / totalGames * 100) : 0;
  $: totalPoints = player ? (player.wins || 0) * 1 + (player.draws || 0) * 0.5 : 0;
</script>

{#if player}
  <Modal isOpen={isOpen} title="Player Profile" on:close={close} maxWidth="max-w-md">
    <svelte:fragment slot="header-icon">
      <span class="text-2xl">{player.avatar || '♟️'}</span>
    </svelte:fragment>

    <div class="space-y-5">
      <!-- Player Header Card -->
      <div class="flex items-center justify-between p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-lg font-bold text-white">{player.name}</h4>
            <Badge variant={player.title ? player.title.toLowerCase() : 'default'} size="sm">
              {player.title || 'Amateur'}
            </Badge>
          </div>
          <p class="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <Globe class="w-3.5 h-3.5 text-slate-500" />
            {player.country || 'International'}
          </p>
        </div>

        <div class="text-right">
          <div class="text-2xl font-black text-amber-400">{player.rating || 1500}</div>
          <div class="text-[10px] uppercase tracking-wider font-semibold text-slate-500">FIDE Rating</div>
        </div>
      </div>

      <!-- Bio / Notes -->
      {#if player.bio}
        <div class="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
          "{player.bio}"
        </div>
      {/if}

      <!-- Performance Stats Grid -->
      <div>
        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <TrendingUp class="w-3.5 h-3.5 text-indigo-400" />
          Career Match Record
        </h5>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-lg font-bold text-emerald-400">{player.wins || 0}</div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Wins</div>
          </div>
          <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-lg font-bold text-slate-300">{player.draws || 0}</div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Draws</div>
          </div>
          <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-lg font-bold text-rose-400">{player.losses || 0}</div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Losses</div>
          </div>
          <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div class="text-lg font-bold text-amber-400">{winRate}%</div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Score Rate</div>
          </div>
        </div>
      </div>

      <!-- Total Games & Score Ratio Bar -->
      <div class="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
        <div class="flex justify-between text-xs font-semibold mb-2">
          <span class="text-slate-400">Total Games: <strong class="text-white">{totalGames}</strong></span>
          <span class="text-slate-400">Total Points: <strong class="text-amber-400">{totalPoints} pts</strong></span>
        </div>

        {#if totalGames > 0}
          <div class="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style="width: {((player.wins || 0) / totalGames) * 100}%"
              class="bg-emerald-500 h-full transition-all"
              title="Wins: {player.wins}"
            ></div>
            <div
              style="width: {((player.draws || 0) / totalGames) * 100}%"
              class="bg-slate-400 h-full transition-all"
              title="Draws: {player.draws}"
            ></div>
            <div
              style="width: {((player.losses || 0) / totalGames) * 100}%"
              class="bg-rose-500 h-full transition-all"
              title="Losses: {player.losses}"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
            <span class="text-emerald-400">● Wins</span>
            <span class="text-slate-300">● Draws</span>
            <span class="text-rose-400">● Losses</span>
          </div>
        {:else}
          <div class="text-center py-2 text-xs text-slate-500">
            No tournament matches recorded yet
          </div>
        {/if}
      </div>

    </div>

    <svelte:fragment slot="footer">
      <button
        type="button"
        on:click={close}
        class="px-5 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
      >
        Close
      </button>
    </svelte:fragment>
  </Modal>
{/if}
