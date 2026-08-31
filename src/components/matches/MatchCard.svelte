<script>
  import { createEventDispatcher } from 'svelte';
  import Badge from '../common/Badge.svelte';
  import { Swords, Play, CheckCircle, Crown, Dice5 } from 'lucide-svelte';

  export let match;
  export let whitePlayer = null;
  export let blackPlayer = null;
  export let simulating = false;

  const dispatch = createEventDispatcher();

  function handleSimulate() {
    dispatch('simulateMatch', match.id);
  }

  function handleManualResult(result) {
    let winnerId = null;
    if (result === '1-0') winnerId = whitePlayer?.id;
    else if (result === '0-1') winnerId = blackPlayer?.id;
    else if (result === '1/2-1/2') winnerId = whitePlayer?.id; // In tiebreak default

    dispatch('manualResult', { matchId: match.id, winnerId, result });
  }

  $: isCompleted = match.status === 'Completed';
  $: isBye = !match.blackPlayerId;
  $: isWhiteWinner = match.winnerId === whitePlayer?.id;
  $: isBlackWinner = blackPlayer && match.winnerId === blackPlayer?.id;
</script>

<div
  class="relative p-4 rounded-2xl border transition-all glass-panel {isCompleted ? 'border-slate-800/80' : 'border-indigo-500/30 shadow-lg shadow-indigo-950/20'}"
>
  <!-- Match Header Info -->
  <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
    <div class="flex items-center gap-2 font-semibold text-slate-400">
      <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-indigo-300">
        Match #{match.matchNumber}
      </span>
      {#if match.isThirdPlaceMatch}
        <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          🥉 3rd Place Playoff
        </span>
      {:else}
        <span>Round {match.round}</span>
      {/if}
    </div>

    <div>
      {#if isCompleted}
        <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full">
          <CheckCircle class="w-3 h-3" />
          {match.result}
        </span>
      {:else}
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded-full">
          Scheduled
        </span>
      {/if}
    </div>
  </div>

  <!-- Players Matchup Grid -->
  <div class="grid grid-cols-11 gap-2 items-center">
    
    <!-- White Player -->
    <div
      class="col-span-5 p-3 rounded-xl border transition-all {isCompleted && isWhiteWinner ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' : 'bg-slate-950/60 border-slate-800'}"
    >
      <div class="flex items-center gap-2.5">
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-lg bg-slate-200 text-slate-900 flex items-center justify-center text-xl font-bold shadow">
            {whitePlayer ? whitePlayer.avatar || '♟️' : '⚪'}
          </div>
          <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-100 border border-slate-400 flex items-center justify-center text-[9px] font-black text-slate-900" title="White Pieces">
            W
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <span class="font-bold text-sm text-white truncate {isCompleted && isWhiteWinner ? 'text-amber-300 font-extrabold' : ''}">
              {whitePlayer ? whitePlayer.name : 'TBD'}
            </span>
            {#if isCompleted && isWhiteWinner}
              <Crown class="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {/if}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            {#if whitePlayer?.title}
              <span class="text-[10px] font-bold text-indigo-400">{whitePlayer.title}</span>
            {/if}
            <span class="text-amber-400 font-semibold">{whitePlayer ? whitePlayer.rating || 1500 : '-'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VS / Score Badge -->
    <div class="col-span-1 text-center flex flex-col items-center justify-center">
      {#if isCompleted}
        <span class="font-mono text-xs font-black text-white px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
          {match.result === '1-0' ? '1 - 0' : match.result === '0-1' ? '0 - 1' : '½ - ½'}
        </span>
      {:else}
        <span class="text-xs font-black text-slate-500 uppercase tracking-widest">VS</span>
      {/if}
    </div>

    <!-- Black Player -->
    <div
      class="col-span-5 p-3 rounded-xl border transition-all {isCompleted && isBlackWinner ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' : 'bg-slate-950/60 border-slate-800'}"
    >
      <div class="flex items-center gap-2.5">
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-lg bg-slate-900 text-slate-100 flex items-center justify-center text-xl font-bold border border-slate-700 shadow">
            {blackPlayer ? blackPlayer.avatar || '♟️' : isBye ? '🛑' : '⚫'}
          </div>
          <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[9px] font-black text-white" title="Black Pieces">
            B
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <span class="font-bold text-sm text-white truncate {isCompleted && isBlackWinner ? 'text-amber-300 font-extrabold' : ''}">
              {blackPlayer ? blackPlayer.name : isBye ? 'BYE (Auto-Advance)' : 'TBD'}
            </span>
            {#if isCompleted && isBlackWinner}
              <Crown class="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {/if}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            {#if blackPlayer?.title}
              <span class="text-[10px] font-bold text-indigo-400">{blackPlayer.title}</span>
            {/if}
            <span class="text-amber-400 font-semibold">{blackPlayer ? blackPlayer.rating || 1500 : '-'}</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Match Controls / Actions -->
  {#if !isCompleted && !isBye}
    <div class="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
      <!-- Random Simulation Button -->
      <button
        on:click={handleSimulate}
        disabled={simulating}
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {#if simulating}
          <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Rolling outcome...</span>
        {:else}
          <Dice5 class="w-4 h-4 text-indigo-200" />
          <span>Simulate Match (Random)</span>
        {/if}
      </button>

      <!-- Director Manual Quick Results -->
      <div class="flex items-center gap-1">
        <button
          on:click={() => handleManualResult('1-0')}
          class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          title="Manual White Win (1-0)"
        >
          1-0
        </button>
        <button
          on:click={() => handleManualResult('1/2-1/2')}
          class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          title="Manual Draw (½-½)"
        >
          ½-½
        </button>
        <button
          on:click={() => handleManualResult('0-1')}
          class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          title="Manual Black Win (0-1)"
        >
          0-1
        </button>
      </div>
    </div>
  {/if}
</div>
