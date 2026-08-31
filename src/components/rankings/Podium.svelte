<script>
  import { onMount } from 'svelte';
  import { Trophy, Crown, Sparkles, Medal, Award } from 'lucide-svelte';
  import { triggerCelebration } from '../common/Confetti.svelte';
  import Badge from '../common/Badge.svelte';

  export let podium = { first: null, second: null, third: null };
  export let autoCelebrate = false;

  onMount(() => {
    if (autoCelebrate && podium.first) {
      setTimeout(() => {
        triggerCelebration();
      }, 300);
    }
  });

  function celebrate() {
    triggerCelebration();
  }
</script>

<div class="relative py-8 px-4 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-md overflow-hidden">
  
  <!-- Subtle background glow -->
  <div class="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-indigo-500/5 to-transparent pointer-events-none"></div>

  <!-- Header -->
  <div class="flex items-center justify-between mb-8 relative z-10">
    <div>
      <h3 class="text-xl font-black text-white flex items-center gap-2">
        <Trophy class="w-6 h-6 text-amber-400" />
        Tournament Champions Podium
      </h3>
      <p class="text-xs text-slate-400 mt-0.5">
        Final Rankings: Gold 1st Place, Silver 2nd Place, Bronze 3rd Place
      </p>
    </div>

    {#if podium.first}
      <button
        on:click={celebrate}
        class="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles class="w-4 h-4 text-slate-950" />
        Celebrate Champions! 🎉
      </button>
    {/if}
  </div>

  {#if !podium.first && !podium.second && !podium.third}
    <div class="text-center py-12 text-slate-500 text-sm">
      <Trophy class="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
      Complete tournament matches to determine 1st, 2nd, and 3rd place winners!
    </div>
  {:else}
    <!-- 3D Podium Layout -->
    <div class="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6 pb-2 relative z-10">
      
      <!-- 2nd Place (Silver) -->
      <div class="flex flex-col items-center">
        {#if podium.second}
          <div class="flex flex-col items-center mb-3 group">
            <div class="relative">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-slate-300 transform group-hover:scale-105 transition-transform">
                {podium.second.avatar || '♟️'}
              </div>
              <span class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 border-2 border-slate-900 flex items-center justify-center text-xs font-black shadow">
                2
              </span>
            </div>

            <div class="text-center mt-3">
              <div class="font-black text-white text-sm sm:text-base truncate max-w-[110px] sm:max-w-[150px]">
                {podium.second.name}
              </div>
              <div class="flex items-center justify-center gap-1 mt-0.5">
                <Badge variant="silver" size="sm">2nd Place</Badge>
              </div>
              <div class="text-xs font-bold text-slate-400 mt-0.5">
                {podium.second.rating || 1500} Elo
              </div>
            </div>
          </div>
        {:else}
          <div class="text-xs text-slate-600 mb-4">TBD</div>
        {/if}

        <!-- 2nd Place Column -->
        <div class="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-slate-400/40 via-slate-600/30 to-slate-800/40 border-t-2 border-x-2 border-slate-400/50 flex flex-col items-center justify-center shadow-lg">
          <Medal class="w-8 h-8 text-slate-300 mb-1" />
          <span class="text-xs sm:text-sm font-black text-slate-200 tracking-wider">SILVER</span>
        </div>
      </div>

      <!-- 1st Place (Gold Champion) -->
      <div class="flex flex-col items-center">
        {#if podium.first}
          <div class="flex flex-col items-center mb-3 group">
            <div class="relative">
              <!-- Animated Crown on top -->
              <Crown class="w-7 h-7 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />

              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-amber-300 gold-glow transform group-hover:scale-105 transition-transform">
                {podium.first.avatar || '👑'}
              </div>
              <span class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 border-2 border-slate-900 flex items-center justify-center text-sm font-black shadow-lg">
                1
              </span>
            </div>

            <div class="text-center mt-3">
              <div class="font-black text-amber-300 text-base sm:text-lg truncate max-w-[130px] sm:max-w-[180px]">
                {podium.first.name}
              </div>
              <div class="flex items-center justify-center gap-1 mt-0.5">
                <Badge variant="gold" size="sm">🏆 Champion</Badge>
              </div>
              <div class="text-xs font-bold text-amber-400 mt-0.5">
                {podium.first.rating || 1500} Elo
              </div>
            </div>
          </div>
        {:else}
          <div class="text-xs text-slate-600 mb-4">TBD</div>
        {/if}

        <!-- 1st Place Column -->
        <div class="w-full h-40 sm:h-52 rounded-t-2xl bg-gradient-to-b from-amber-500/40 via-amber-600/30 to-slate-800/40 border-t-2 border-x-2 border-amber-400/70 flex flex-col items-center justify-center shadow-2xl">
          <Trophy class="w-10 h-10 text-amber-400 mb-1" />
          <span class="text-sm sm:text-base font-black text-amber-300 tracking-wider">GOLD</span>
          <span class="text-[10px] text-amber-200/80 font-bold uppercase">1st Place</span>
        </div>
      </div>

      <!-- 3rd Place (Bronze) -->
      <div class="flex flex-col items-center">
        {#if podium.third}
          <div class="flex flex-col items-center mb-3 group">
            <div class="relative">
              <div class="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-xl border-2 border-amber-600 transform group-hover:scale-105 transition-transform">
                {podium.third.avatar || '♟️'}
              </div>
              <span class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white border-2 border-slate-900 flex items-center justify-center text-xs font-black shadow">
                3
              </span>
            </div>

            <div class="text-center mt-3">
              <div class="font-black text-white text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]">
                {podium.third.name}
              </div>
              <div class="flex items-center justify-center gap-1 mt-0.5">
                <Badge variant="bronze" size="sm">3rd Place</Badge>
              </div>
              <div class="text-xs font-bold text-amber-500 mt-0.5">
                {podium.third.rating || 1500} Elo
              </div>
            </div>
          </div>
        {:else}
          <div class="text-xs text-slate-600 mb-4">TBD</div>
        {/if}

        <!-- 3rd Place Column -->
        <div class="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-b from-amber-800/40 via-amber-900/30 to-slate-800/40 border-t-2 border-x-2 border-amber-700/50 flex flex-col items-center justify-center shadow-lg">
          <Award class="w-7 h-7 text-amber-500 mb-1" />
          <span class="text-xs sm:text-sm font-black text-amber-400 tracking-wider">BRONZE</span>
        </div>
      </div>

    </div>
  {/if}
</div>
