<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { tournamentService, matchService, playerService } from '../../db/database.js';
  import { generateInitialPairings, generateNextRoundPairings } from '../../services/pairingService.js';
  import { simulateMatch, simulateRound, simulateEntireTournament } from '../../services/simulationService.js';
  import { getTournamentRankings } from '../../services/rankingService.js';
  import { toast } from '../../utils/toastStore.js';
  import MatchCard from '../matches/MatchCard.svelte';
  import Podium from '../rankings/Podium.svelte';
  import StandingsTable from '../rankings/StandingsTable.svelte';
  import PlayerSelectorModal from './PlayerSelectorModal.svelte';
  import TournamentFormModal from './TournamentFormModal.svelte';
  import Badge from '../common/Badge.svelte';
  import {
    Trophy, ArrowLeft, Users, Swords, Play, FastForward, Dice5,
    UserPlus, Edit3, Trash2, Calendar, Award, RefreshCw, Layers
  } from 'lucide-svelte';

  export let tournamentId;

  const dispatch = createEventDispatcher();

  let tournament = null;
  let registeredPlayers = [];
  let playerMap = new Map();
  let matches = [];
  let podium = { first: null, second: null, third: null };
  let standings = [];
  let loading = true;
  let activeTab = 'matches'; // 'matches' | 'players' | 'rankings'
  let simulatingMatchId = null;
  let isBatchSimulating = false;

  let isRosterModalOpen = false;
  let isEditModalOpen = false;

  onMount(async () => {
    await loadTournamentData();
  });

  export async function loadTournamentData() {
    loading = true;
    try {
      tournament = await tournamentService.getById(tournamentId);
      if (!tournament) {
        toast.error('Tournament not found');
        goBack();
        return;
      }

      registeredPlayers = await tournamentService.getRegisteredPlayers(tournamentId);
      
      // Load all players into map for fast lookup in match cards
      const allPlayers = await playerService.getAll();
      playerMap = new Map(allPlayers.map(p => [p.id, p]));

      matches = await matchService.getByTournament(tournamentId);

      // Load rankings
      const rankingData = await getTournamentRankings(tournamentId);
      podium = rankingData.podium;
      standings = rankingData.standings;
    } catch (err) {
      toast.error('Failed to load tournament details');
    } finally {
      loading = false;
    }
  }

  function goBack() {
    dispatch('back');
  }

  // Group matches by round
  $: roundsMap = matches.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  $: roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
  $: maxRound = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 0;
  $: completedMatchesCount = matches.filter(m => m.status === 'Completed').length;
  $: isAllMatchesDone = matches.length > 0 && completedMatchesCount === matches.length;

  async function handleGeneratePairings() {
    if (registeredPlayers.length < 2) {
      toast.warning('Register at least 2 players to generate tournament pairings.');
      isRosterModalOpen = true;
      return;
    }

    try {
      await generateInitialPairings(tournamentId, registeredPlayers);
      await tournamentService.update(tournamentId, { status: 'In Progress' });
      toast.success('Generated Round 1 random pairings!');
      await loadTournamentData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate pairings');
    }
  }

  async function handleSimulateSingleMatch(event) {
    const matchId = event.detail;
    simulatingMatchId = matchId;
    try {
      await simulateMatch(matchId);
      toast.success('Match simulated randomly!');
      await loadTournamentData();
    } catch (err) {
      toast.error('Failed to simulate match');
    } finally {
      simulatingMatchId = null;
    }
  }

  async function handleManualResult(event) {
    const { matchId, winnerId, result } = event.detail;
    try {
      await matchService.updateResult(matchId, { winnerId, result });
      toast.success(`Result recorded: ${result}`);
      await loadTournamentData();
    } catch (err) {
      toast.error('Failed to record result');
    }
  }

  async function handleSimulateCurrentRound() {
    if (roundNumbers.length === 0) {
      await handleGeneratePairings();
      return;
    }

    isBatchSimulating = true;
    try {
      // Find current active round (the earliest round with uncompleted matches)
      let activeRound = roundNumbers.find(r => roundsMap[r].some(m => m.status !== 'Completed')) || maxRound;
      
      await simulateRound(tournamentId, activeRound);
      toast.success(`Completed simulation for Round ${activeRound}!`);

      // Try to generate next round pairings
      const nextRoundRes = await generateNextRoundPairings(tournamentId, activeRound);
      if (nextRoundRes.completed) {
        await tournamentService.update(tournamentId, { status: 'Completed' });
        toast.success('Tournament completed! Champion crowned!');
        activeTab = 'rankings';
      }

      await loadTournamentData();
    } catch (err) {
      toast.error(err.message || 'Error during round simulation');
    } finally {
      isBatchSimulating = false;
    }
  }

  async function handleSimulateEntireTournament() {
    if (registeredPlayers.length < 2) {
      toast.warning('Register at least 2 players to run tournament.');
      isRosterModalOpen = true;
      return;
    }

    isBatchSimulating = true;
    try {
      await simulateEntireTournament(tournamentId);
      toast.success('Full tournament simulated! Check rankings and podium!');
      activeTab = 'rankings';
      await loadTournamentData();
    } catch (err) {
      toast.error(err.message || 'Error during tournament simulation');
    } finally {
      isBatchSimulating = false;
    }
  }

  async function handleDeleteTournament() {
    if (confirm(`Are you sure you want to delete ${tournament.name}? All match history will be removed.`)) {
      try {
        await tournamentService.delete(tournament.id);
        toast.success('Tournament deleted');
        goBack();
      } catch (err) {
        toast.error('Failed to delete tournament');
      }
    }
  }

  async function handleSaveTournament(event) {
    const data = event.detail;
    try {
      await tournamentService.update(data.id, data);
      toast.success('Tournament details updated');
      isEditModalOpen = false;
      await loadTournamentData();
    } catch (err) {
      toast.error('Failed to update tournament');
    }
  }

  function getRoundTitle(round, totalRounds, matchesInRound) {
    if (matchesInRound.length === 1 && !matchesInRound[0].isThirdPlaceMatch) {
      return '🏆 Grand Final';
    }
    if (matchesInRound.length === 2 && !matchesInRound.some(m => m.isThirdPlaceMatch)) {
      return '⚔️ Semi-Finals';
    }
    if (matchesInRound.length === 4) {
      return '🛡️ Quarter-Finals';
    }
    return `Round ${round}`;
  }
</script>

{#if loading}
  <div class="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
    <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <p class="text-sm">Loading tournament arena...</p>
  </div>
{:else if tournament}
  <div class="space-y-6">
    
    <!-- Top Back & Actions Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <button
        on:click={goBack}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Tournaments
      </button>

      <div class="flex items-center gap-2">
        <button
          on:click={() => isRosterModalOpen = true}
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <Users class="w-4 h-4 text-indigo-400" />
          Roster ({registeredPlayers.length}/{tournament.maxPlayers || 8})
        </button>

        <button
          on:click={() => isEditModalOpen = true}
          class="p-2 text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          title="Edit Tournament"
        >
          <Edit3 class="w-4 h-4" />
        </button>

        <button
          on:click={handleDeleteTournament}
          class="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          title="Delete Tournament"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Tournament Overview Header Banner -->
    <div class="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <!-- Left details -->
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white">{tournament.name}</h1>
            <Badge
              variant={tournament.status === 'Completed' ? 'success' : tournament.status === 'In Progress' ? 'warning' : 'info'}
              size="md"
            >
              {tournament.status}
            </Badge>
          </div>

          {#if tournament.description}
            <p class="text-sm text-slate-300 max-w-2xl">{tournament.description}</p>
          {/if}

          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span class="flex items-center gap-1.5">
              <Trophy class="w-4 h-4 text-amber-400" />
              Format: <strong class="text-slate-200">{tournament.format || 'Knockout'}</strong>
            </span>
            <span class="flex items-center gap-1.5">
              <Calendar class="w-4 h-4 text-slate-500" />
              Start Date: <strong class="text-slate-200">{tournament.startDate || 'TBD'}</strong>
            </span>
            <span class="flex items-center gap-1.5">
              <Users class="w-4 h-4 text-indigo-400" />
              Players: <strong class="text-slate-200">{registeredPlayers.length} / {tournament.maxPlayers || 8}</strong>
            </span>
          </div>
        </div>

        <!-- Right Quick Simulation Engine Controls -->
        <div class="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          {#if matches.length === 0}
            <button
              on:click={handleGeneratePairings}
              class="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Dice5 class="w-5 h-5 text-indigo-200" />
              Generate Pairings (Random)
            </button>
          {:else}
            {#if tournament.status !== 'Completed'}
              <button
                on:click={handleSimulateCurrentRound}
                disabled={isBatchSimulating}
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all"
              >
                <Play class="w-4 h-4" />
                Simulate Current Round
              </button>

              <button
                on:click={handleSimulateEntireTournament}
                disabled={isBatchSimulating}
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all"
              >
                <FastForward class="w-4 h-4" />
                Fast Sim Entire Tournament
              </button>
            {/if}

            <button
              on:click={handleGeneratePairings}
              class="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              Re-roll Pairings
            </button>
          {/if}
        </div>

      </div>
    </div>

    <!-- Navigation Tabs (Matches, Players, Rankings) -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
      <button
        on:click={() => activeTab = 'matches'}
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all {activeTab === 'matches' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
      >
        <Swords class="w-4 h-4" />
        Matches & Rounds ({matches.length})
      </button>

      <button
        on:click={() => activeTab = 'players'}
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all {activeTab === 'players' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
      >
        <Users class="w-4 h-4" />
        Registered Players ({registeredPlayers.length})
      </button>

      <button
        on:click={() => activeTab = 'rankings'}
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all {activeTab === 'rankings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
      >
        <Trophy class="w-4 h-4" />
        Rankings & Podium
      </button>
    </div>

    <!-- Tab 1: Matches & Rounds View -->
    {#if activeTab === 'matches'}
      <div class="space-y-8">
        {#if matches.length === 0}
          <div class="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
            <div class="text-4xl mb-3">🎲</div>
            <h3 class="text-lg font-bold text-white mb-1">Pairings Not Generated Yet</h3>
            <p class="text-sm text-slate-400 max-w-md mx-auto mb-5">
              Click the button below to randomly pair registered players and begin Round 1 matches.
            </p>
            <button
              on:click={handleGeneratePairings}
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30"
            >
              Generate Random Pairings
            </button>
          </div>
        {:else}
          {#each roundNumbers as round}
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-extrabold text-white flex items-center gap-2">
                  <Layers class="w-5 h-5 text-indigo-400" />
                  {getRoundTitle(round, maxRound, roundsMap[round])}
                </h3>
                <span class="text-xs font-semibold text-slate-400">
                  {roundsMap[round].filter(m => m.status === 'Completed').length} / {roundsMap[round].length} Completed
                </span>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {#each roundsMap[round] as match (match.id)}
                  <MatchCard
                    {match}
                    whitePlayer={playerMap.get(match.whitePlayerId)}
                    blackPlayer={match.blackPlayerId ? playerMap.get(match.blackPlayerId) : null}
                    simulating={simulatingMatchId === match.id}
                    on:simulateMatch={handleSimulateSingleMatch}
                    on:manualResult={handleManualResult}
                  />
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    <!-- Tab 2: Registered Players Roster View -->
    {#if activeTab === 'players'}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Registered Player Roster</h3>
          <button
            on:click={() => isRosterModalOpen = true}
            class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30"
          >
            <UserPlus class="w-4 h-4" />
            Manage Roster
          </button>
        </div>

        {#if registeredPlayers.length === 0}
          <div class="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-6">
            <p class="text-sm text-slate-400 mb-3">No players registered yet for this tournament.</p>
            <button
              on:click={() => isRosterModalOpen = true}
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              Add Players to Roster
            </button>
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {#each registeredPlayers as p (p.id)}
              <div class="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between glass-panel">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-slate-700">
                    {p.avatar || '♟️'}
                  </div>
                  <div>
                    <div class="font-bold text-sm text-white">{p.name}</div>
                    <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span class="text-amber-400 font-semibold">{p.rating || 1500}</span>
                      <span>•</span>
                      <span>{p.title || 'Amateur'}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Tab 3: Rankings & Podium View -->
    {#if activeTab === 'rankings'}
      <div class="space-y-6">
        <!-- 1st, 2nd, 3rd Podium Component -->
        <Podium {podium} autoCelebrate={tournament.status === 'Completed'} />

        <!-- Complete Standings Table -->
        <StandingsTable {standings} />
      </div>
    {/if}

  </div>
{/if}

<!-- Modals -->
<PlayerSelectorModal
  isOpen={isRosterModalOpen}
  {tournament}
  on:close={() => isRosterModalOpen = false}
  on:rosterUpdated={loadTournamentData}
/>

<TournamentFormModal
  isOpen={isEditModalOpen}
  tournamentToEdit={tournament}
  on:close={() => isEditModalOpen = false}
  on:save={handleSaveTournament}
/>
