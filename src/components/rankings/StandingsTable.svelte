<script>
  import Badge from '../common/Badge.svelte';
  import { Trophy, Medal, Award, Star } from 'lucide-svelte';

  export let standings = [];
</script>

<div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
  <div class="p-4 border-b border-slate-800 flex items-center justify-between">
    <h4 class="font-bold text-white text-base flex items-center gap-2">
      <Star class="w-4 h-4 text-amber-400" />
      Complete Tournament Standings Table
    </h4>
    <span class="text-xs text-slate-400">
      Points System: Win = 1.0 | Draw = 0.5 | Loss = 0.0
    </span>
  </div>

  {#if standings.length === 0}
    <div class="text-center py-10 text-slate-500 text-xs">
      No standing data available yet.
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th class="py-3 px-4 text-center w-12">Rank</th>
            <th class="py-3 px-4">Player</th>
            <th class="py-3 px-4 text-center">Title</th>
            <th class="py-3 px-4 text-center">Rating</th>
            <th class="py-3 px-4 text-center">Played</th>
            <th class="py-3 px-4 text-center">W</th>
            <th class="py-3 px-4 text-center">D</th>
            <th class="py-3 px-4 text-center">L</th>
            <th class="py-3 px-4 text-center">Points</th>
            <th class="py-3 px-4 text-right">Result</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 text-sm">
          {#each standings as s (s.player.id)}
            <tr
              class="hover:bg-slate-800/40 transition-colors
                {s.rank === 1 ? 'bg-amber-500/5' : ''}
                {s.rank === 2 ? 'bg-slate-300/5' : ''}
                {s.rank === 3 ? 'bg-amber-800/5' : ''}
              "
            >
              <!-- Rank -->
              <td class="py-3.5 px-4 text-center font-black">
                {#if s.rank === 1}
                  <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/30">
                    1
                  </span>
                {:else if s.rank === 2}
                  <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 text-xs font-black shadow-md">
                    2
                  </span>
                {:else if s.rank === 3}
                  <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-black shadow-md">
                    3
                  </span>
                {:else}
                  <span class="text-slate-500 text-xs font-bold">{s.rank}</span>
                {/if}
              </td>

              <!-- Player Details -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">
                    {s.player.avatar || '♟️'}
                  </div>
                  <div>
                    <div class="font-bold text-white flex items-center gap-1.5">
                      <span>{s.player.name}</span>
                      {#if s.rank === 1}
                        <Trophy class="w-3.5 h-3.5 text-amber-400" />
                      {/if}
                    </div>
                    <div class="text-xs text-slate-400">{s.player.country || 'International'}</div>
                  </div>
                </div>
              </td>

              <!-- Title -->
              <td class="py-3.5 px-4 text-center">
                <Badge variant={s.player.title ? s.player.title.toLowerCase() : 'default'} size="sm">
                  {s.player.title || 'Amateur'}
                </Badge>
              </td>

              <!-- Rating -->
              <td class="py-3.5 px-4 text-center font-bold text-amber-400">
                {s.player.rating || 1500}
              </td>

              <!-- MP -->
              <td class="py-3.5 px-4 text-center font-medium text-slate-300">
                {s.played}
              </td>

              <!-- Wins -->
              <td class="py-3.5 px-4 text-center font-bold text-emerald-400">
                {s.wins}
              </td>

              <!-- Draws -->
              <td class="py-3.5 px-4 text-center font-medium text-slate-400">
                {s.draws}
              </td>

              <!-- Losses -->
              <td class="py-3.5 px-4 text-center font-medium text-rose-400">
                {s.losses}
              </td>

              <!-- Total Points -->
              <td class="py-3.5 px-4 text-center">
                <span class="font-mono text-base font-black px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                  {s.points}
                </span>
              </td>

              <!-- Outcome Badge -->
              <td class="py-3.5 px-4 text-right">
                {#if s.rank === 1}
                  <Badge variant="gold" size="sm">🏆 Champion</Badge>
                {:else if s.rank === 2}
                  <Badge variant="silver" size="sm">🥈 Runner-up</Badge>
                {:else if s.rank === 3}
                  <Badge variant="bronze" size="sm">🥉 3rd Place</Badge>
                {:else if s.highestRoundReached > 1}
                  <Badge variant="default" size="sm">Round {s.highestRoundReached}</Badge>
                {:else}
                  <span class="text-xs text-slate-500">Participant</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
