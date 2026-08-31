import { db, matchService, playerService, tournamentService } from '../db/database.js';
import { generateInitialPairings, generateNextRoundPairings } from './pairingService.js';

/**
 * Random Match Outcome Generator
 * Generates match results randomly.
 * @param {Object} whitePlayer 
 * @param {Object} blackPlayer 
 * @param {boolean} useEloWeighting - if false, pure 50-50 random. If true, rating-weighted.
 */
export function calculateRandomMatchOutcome(whitePlayer, blackPlayer, useEloWeighting = false) {
  if (!blackPlayer) {
    // Bye match
    return {
      winnerId: whitePlayer.id,
      result: '1-0 (Bye)',
      whiteScore: 1,
      blackScore: 0,
      tiebreak: false
    };
  }

  let whiteWinProbability = 0.5;

  if (useEloWeighting && whitePlayer.rating && blackPlayer.rating) {
    // Standard FIDE Elo expected score formula with slight +0.05 White advantage
    const exponent = (blackPlayer.rating - whitePlayer.rating) / 400;
    whiteWinProbability = 1 / (1 + Math.pow(10, exponent)) + 0.04;
    whiteWinProbability = Math.max(0.15, Math.min(0.85, whiteWinProbability));
  }

  const roll = Math.random();

  // Probability ranges: White win (~40%), Black win (~35%), Draw (~25%)
  const whiteThreshold = whiteWinProbability * 0.75;
  const drawThreshold = whiteThreshold + 0.25;

  if (roll < whiteThreshold) {
    // White wins
    return {
      winnerId: whitePlayer.id,
      result: '1-0',
      whiteScore: 1,
      blackScore: 0,
      tiebreak: false
    };
  } else if (roll < drawThreshold) {
    // Draw in classical -> In knockout, a random tiebreak (Armageddon/blitz) decides the advancing winner
    const tiebreakWinnerRoll = Math.random();
    const tiebreakWinnerId = tiebreakWinnerRoll < 0.5 ? whitePlayer.id : blackPlayer.id;
    return {
      winnerId: tiebreakWinnerId,
      result: '1/2-1/2',
      whiteScore: 0.5,
      blackScore: 0.5,
      tiebreak: true,
      tiebreakWinnerId
    };
  } else {
    // Black wins
    return {
      winnerId: blackPlayer.id,
      result: '0-1',
      whiteScore: 0,
      blackScore: 1,
      tiebreak: false
    };
  }
}

/**
 * Simulates a single match and updates the database
 */
export async function simulateMatch(matchId, useEloWeighting = false) {
  const match = await db.matches.get(Number(matchId));
  if (!match) throw new Error('Match not found');
  if (match.status === 'Completed') return match;

  const whitePlayer = await playerService.getById(match.whitePlayerId);
  const blackPlayer = match.blackPlayerId ? await playerService.getById(match.blackPlayerId) : null;

  const outcome = calculateRandomMatchOutcome(whitePlayer, blackPlayer, useEloWeighting);

  // Update match in database
  await matchService.updateResult(match.id, {
    winnerId: outcome.winnerId,
    result: outcome.result
  });

  // Update players' career statistics
  if (whitePlayer) {
    if (outcome.whiteScore === 1) {
      await playerService.update(whitePlayer.id, { wins: (whitePlayer.wins || 0) + 1 });
    } else if (outcome.whiteScore === 0.5) {
      await playerService.update(whitePlayer.id, { draws: (whitePlayer.draws || 0) + 1 });
    } else {
      await playerService.update(whitePlayer.id, { losses: (whitePlayer.losses || 0) + 1 });
    }
  }

  if (blackPlayer) {
    if (outcome.blackScore === 1) {
      await playerService.update(blackPlayer.id, { wins: (blackPlayer.wins || 0) + 1 });
    } else if (outcome.blackScore === 0.5) {
      await playerService.update(blackPlayer.id, { draws: (blackPlayer.draws || 0) + 1 });
    } else {
      await playerService.update(blackPlayer.id, { losses: (blackPlayer.losses || 0) + 1 });
    }
  }

  return { ...match, ...outcome, status: 'Completed' };
}

/**
 * Simulates all pending matches in a specific round
 */
export async function simulateRound(tournamentId, round, useEloWeighting = false) {
  const matches = await matchService.getByTournamentAndRound(tournamentId, round);
  const pending = matches.filter(m => m.status !== 'Completed');

  const results = [];
  for (const m of pending) {
    const res = await simulateMatch(m.id, useEloWeighting);
    results.push(res);
  }

  return results;
}

/**
 * Simulates an entire tournament from start to finish
 */
export async function simulateEntireTournament(tournamentId, useEloWeighting = false) {
  const tournament = await tournamentService.getById(tournamentId);
  if (!tournament) throw new Error('Tournament not found');

  const registeredPlayers = await tournamentService.getRegisteredPlayers(tournamentId);
  if (registeredPlayers.length < 2) {
    throw new Error('Tournament requires at least 2 registered players.');
  }

  // Ensure Round 1 pairings exist
  let matches = await matchService.getByTournament(tournamentId);
  if (matches.length === 0) {
    await generateInitialPairings(tournamentId, registeredPlayers);
    matches = await matchService.getByTournament(tournamentId);
  }

  // Set tournament to In Progress
  await tournamentService.update(tournamentId, { status: 'In Progress' });

  let currentRound = 1;
  let isFinished = false;
  let maxRoundsSafety = 10;

  while (!isFinished && maxRoundsSafety > 0) {
    maxRoundsSafety--;
    // Simulate all matches in current round
    await simulateRound(tournamentId, currentRound, useEloWeighting);

    // Try to generate next round
    const nextRoundResult = await generateNextRoundPairings(tournamentId, currentRound);
    
    if (nextRoundResult.completed) {
      isFinished = true;
    } else {
      currentRound++;
    }
  }

  // Mark tournament as completed
  await tournamentService.update(tournamentId, {
    status: 'Completed',
    endDate: new Date().toISOString().split('T')[0]
  });

  return { completed: true, finalRound: currentRound };
}
