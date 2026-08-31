import { matchService } from '../db/database.js';

/**
 * Fisher-Yates shuffle algorithm for truly random array permutation
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate initial random pairings (Round 1) for a tournament
 * @param {number} tournamentId 
 * @param {Array<Object>} players - Array of registered player objects
 */
export async function generateInitialPairings(tournamentId, players) {
  if (!players || players.length < 2) {
    throw new Error('At least 2 players are required to generate pairings.');
  }

  // Clear any existing matches for this tournament
  await matchService.clearMatches(tournamentId);

  // Randomly shuffle the registered players
  const shuffled = shuffleArray(players);
  const matchesToCreate = [];

  let matchNum = 1;
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      // Normal pairing: White vs Black
      matchesToCreate.push({
        tournamentId: Number(tournamentId),
        round: 1,
        matchNumber: matchNum++,
        whitePlayerId: shuffled[i].id,
        blackPlayerId: shuffled[i + 1].id,
        winnerId: null,
        result: 'Pending',
        status: 'Scheduled'
      });
    } else {
      // Odd player receives a BYE (advances automatically to next round)
      matchesToCreate.push({
        tournamentId: Number(tournamentId),
        round: 1,
        matchNumber: matchNum++,
        whitePlayerId: shuffled[i].id,
        blackPlayerId: null,
        winnerId: shuffled[i].id,
        result: '1-0 (Bye)',
        status: 'Completed',
        completedAt: new Date().toISOString()
      });
    }
  }

  // Insert matches into database
  const createdMatches = [];
  for (const m of matchesToCreate) {
    const id = await matchService.createMatch(m);
    createdMatches.push({ ...m, id });
  }

  return createdMatches;
}

/**
 * Generate next round pairings based on previous round winners
 * @param {number} tournamentId 
 * @param {number} currentRound 
 */
export async function generateNextRoundPairings(tournamentId, currentRound) {
  const prevMatches = await matchService.getByTournamentAndRound(tournamentId, currentRound);
  
  if (prevMatches.length === 0) {
    throw new Error(`No matches found for round ${currentRound}`);
  }

  // Check if all previous round matches are completed
  const incomplete = prevMatches.filter(m => m.status !== 'Completed' || !m.winnerId);
  if (incomplete.length > 0) {
    throw new Error(`Round ${currentRound} has incomplete matches. Finish all matches first.`);
  }

  // If there was only 1 match in previous round (Finals), tournament is complete!
  if (prevMatches.length === 1 && !prevMatches[0].isThirdPlaceMatch) {
    return { completed: true };
  }

  // Collect winners from previous round
  const winners = prevMatches.map(m => m.winnerId).filter(Boolean);
  
  // Randomly pair the advancing winners for the next round
  const shuffledWinners = shuffleArray(winners);
  const nextRound = currentRound + 1;
  const nextMatches = [];

  // If we had exactly 2 semifinal matches (4 players), we also schedule a 3rd place match!
  const isFromSemiFinals = prevMatches.length === 2;
  const semiFinalLosers = [];

  if (isFromSemiFinals) {
    prevMatches.forEach(m => {
      const loserId = m.whitePlayerId === m.winnerId ? m.blackPlayerId : m.whitePlayerId;
      if (loserId) semiFinalLosers.push(loserId);
    });
  }

  let matchNum = 1;
  for (let i = 0; i < shuffledWinners.length; i += 2) {
    if (i + 1 < shuffledWinners.length) {
      const matchData = {
        tournamentId: Number(tournamentId),
        round: nextRound,
        matchNumber: matchNum++,
        whitePlayerId: shuffledWinners[i],
        blackPlayerId: shuffledWinners[i + 1],
        winnerId: null,
        result: 'Pending',
        status: 'Scheduled'
      };
      const id = await matchService.createMatch(matchData);
      nextMatches.push({ ...matchData, id });
    } else {
      // Bye
      const matchData = {
        tournamentId: Number(tournamentId),
        round: nextRound,
        matchNumber: matchNum++,
        whitePlayerId: shuffledWinners[i],
        blackPlayerId: null,
        winnerId: shuffledWinners[i],
        result: '1-0 (Bye)',
        status: 'Completed',
        completedAt: new Date().toISOString()
      };
      const id = await matchService.createMatch(matchData);
      nextMatches.push({ ...matchData, id });
    }
  }

  // Schedule 3rd Place Match if coming from Semi-Finals
  if (isFromSemiFinals && semiFinalLosers.length === 2) {
    const thirdPlaceMatch = {
      tournamentId: Number(tournamentId),
      round: nextRound,
      matchNumber: matchNum++,
      whitePlayerId: semiFinalLosers[0],
      blackPlayerId: semiFinalLosers[1],
      winnerId: null,
      result: 'Pending',
      status: 'Scheduled',
      isThirdPlaceMatch: true
    };
    const id = await matchService.createMatch(thirdPlaceMatch);
    nextMatches.push({ ...thirdPlaceMatch, id });
  }

  return { completed: false, matches: nextMatches };
}
