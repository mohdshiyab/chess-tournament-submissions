import { matchService, playerService, tournamentService } from '../db/database.js';

/**
 * Calculate full rankings and top 3 podium for a tournament
 * @param {number} tournamentId 
 */
export async function getTournamentRankings(tournamentId) {
  const registeredPlayers = await tournamentService.getRegisteredPlayers(tournamentId);
  const matches = await matchService.getByTournament(tournamentId);

  if (registeredPlayers.length === 0) {
    return { podium: { first: null, second: null, third: null }, standings: [] };
  }

  // Map to track tournament stats per player
  const playerStatsMap = new Map();
  registeredPlayers.forEach(p => {
    playerStatsMap.set(p.id, {
      player: p,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      isFinalist: false,
      isChampion: false,
      isRunnerUp: false,
      isThirdPlace: false,
      highestRoundReached: 0
    });
  });

  // Calculate points from completed matches
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const maxRound = matches.reduce((max, m) => Math.max(max, m.round), 1);

  completedMatches.forEach(m => {
    const whiteStats = playerStatsMap.get(m.whitePlayerId);
    const blackStats = m.blackPlayerId ? playerStatsMap.get(m.blackPlayerId) : null;

    if (whiteStats) {
      whiteStats.played++;
      whiteStats.highestRoundReached = Math.max(whiteStats.highestRoundReached, m.round);
    }
    if (blackStats) {
      blackStats.played++;
      blackStats.highestRoundReached = Math.max(blackStats.highestRoundReached, m.round);
    }

    if (m.result.startsWith('1-0')) {
      if (whiteStats) {
        whiteStats.points += 1;
        whiteStats.wins += 1;
      }
      if (blackStats) {
        blackStats.losses += 1;
      }
    } else if (m.result.startsWith('0-1')) {
      if (blackStats) {
        blackStats.points += 1;
        blackStats.wins += 1;
      }
      if (whiteStats) {
        whiteStats.losses += 1;
      }
    } else if (m.result.startsWith('1/2-1/2')) {
      if (whiteStats) {
        whiteStats.points += 0.5;
        whiteStats.draws += 1;
      }
      if (blackStats) {
        blackStats.points += 0.5;
        blackStats.draws += 1;
      }
    }
  });

  // Find 1st, 2nd, 3rd places specifically from finals / 3rd place match if present
  let firstPlacePlayer = null;
  let secondPlacePlayer = null;
  let thirdPlacePlayer = null;

  // Final match is the non-third-place match in max round
  const finalMatch = matches.find(m => m.round === maxRound && !m.isThirdPlaceMatch && m.status === 'Completed');
  const thirdPlaceMatch = matches.find(m => m.isThirdPlaceMatch && m.status === 'Completed');

  if (finalMatch && finalMatch.winnerId) {
    const championId = finalMatch.winnerId;
    const runnerUpId = finalMatch.whitePlayerId === championId ? finalMatch.blackPlayerId : finalMatch.whitePlayerId;

    const champStats = playerStatsMap.get(championId);
    if (champStats) {
      champStats.isChampion = true;
      firstPlacePlayer = champStats.player;
    }

    if (runnerUpId) {
      const runnerUpStats = playerStatsMap.get(runnerUpId);
      if (runnerUpStats) {
        runnerUpStats.isRunnerUp = true;
        secondPlacePlayer = runnerUpStats.player;
      }
    }
  }

  if (thirdPlaceMatch && thirdPlaceMatch.winnerId) {
    const thirdWinnerStats = playerStatsMap.get(thirdPlaceMatch.winnerId);
    if (thirdWinnerStats) {
      thirdWinnerStats.isThirdPlace = true;
      thirdPlacePlayer = thirdWinnerStats.player;
    }
  }

  // Convert map to standings array and sort
  const standings = Array.from(playerStatsMap.values()).sort((a, b) => {
    // 1st: Champion always 1st
    if (a.isChampion) return -1;
    if (b.isChampion) return 1;

    // 2nd: Runner-up always 2nd
    if (a.isRunnerUp) return -1;
    if (b.isRunnerUp) return 1;

    // 3rd: 3rd place match winner
    if (a.isThirdPlace) return -1;
    if (b.isThirdPlace) return 1;

    // Highest round reached
    if (b.highestRoundReached !== a.highestRoundReached) {
      return b.highestRoundReached - a.highestRoundReached;
    }

    // Points
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // Wins
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    // Rating
    return (b.player.rating || 0) - (a.player.rating || 0);
  });

  // Assign ranks
  standings.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  // If podium players were not explicitly determined by finals, use top 3 from standings
  if (!firstPlacePlayer && standings.length > 0) {
    firstPlacePlayer = standings[0].player;
  }
  if (!secondPlacePlayer && standings.length > 1) {
    secondPlacePlayer = standings[1].player;
  }
  if (!thirdPlacePlayer && standings.length > 2) {
    thirdPlacePlayer = standings[2].player;
  }

  return {
    podium: {
      first: firstPlacePlayer,
      second: secondPlacePlayer,
      third: thirdPlacePlayer
    },
    standings
  };
}
