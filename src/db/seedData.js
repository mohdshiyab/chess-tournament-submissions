import { db } from './database.js';

export const INITIAL_PLAYERS = [
  {
    name: 'Magnus Carlsen',
    rating: 2832,
    title: 'GM',
    country: 'Norway',
    avatar: '👑',
    bio: '5-time World Chess Champion, highest rated player in chess history.',
    wins: 14,
    losses: 2,
    draws: 4
  },
  {
    name: 'Hikaru Nakamura',
    rating: 2802,
    title: 'GM',
    country: 'USA',
    avatar: '⚡',
    bio: '5-time US Champion and World Fischer Random Chess Champion.',
    wins: 12,
    losses: 3,
    draws: 5
  },
  {
    name: 'Gukesh D',
    rating: 2794,
    title: 'GM',
    country: 'India',
    avatar: '🎯',
    bio: 'Youngest ever Candidates Tournament Winner and World Championship Challenger.',
    wins: 11,
    losses: 2,
    draws: 7
  },
  {
    name: 'Fabiano Caruana',
    rating: 2805,
    title: 'GM',
    country: 'USA',
    avatar: '♟️',
    bio: '3-time US Champion and 2018 World Chess Championship Challenger.',
    wins: 10,
    losses: 4,
    draws: 6
  },
  {
    name: 'Praggnanandhaa R',
    rating: 2755,
    title: 'GM',
    country: 'India',
    avatar: '🔥',
    bio: 'Chess prodigy and 2023 FIDE World Cup Finalist.',
    wins: 9,
    losses: 3,
    draws: 8
  },
  {
    name: 'Alireza Firouzja',
    rating: 2767,
    title: 'GM',
    country: 'France',
    avatar: '🚀',
    bio: 'Youngest player to surpass 2800 Elo rating in chess history.',
    wins: 10,
    losses: 5,
    draws: 5
  },
  {
    name: 'Ding Liren',
    rating: 2748,
    title: 'GM',
    country: 'China',
    avatar: '🛡️',
    bio: '2023 FIDE World Chess Champion.',
    wins: 8,
    losses: 4,
    draws: 8
  },
  {
    name: 'Ian Nepomniachtchi',
    rating: 2758,
    title: 'GM',
    country: 'FIDE',
    avatar: '⚔️',
    bio: '2-time World Chess Championship Challenger and 2-time Candidates Winner.',
    wins: 9,
    losses: 5,
    draws: 6
  }
];

export const INITIAL_TOURNAMENTS = [
  {
    name: 'FIDE Candidates Tournament 2026',
    description: 'Premier 8-player tournament to crown the next World Chess Championship Challenger.',
    format: 'Knockout',
    status: 'In Progress',
    maxPlayers: 8,
    startDate: '2026-08-01',
    endDate: '2026-08-15'
  },
  {
    name: 'Tata Steel Chess Masters',
    description: 'The Wimbledon of chess featuring elite global grandmasters.',
    format: 'Single Elimination',
    status: 'Upcoming',
    maxPlayers: 8,
    startDate: '2026-09-10',
    endDate: '2026-09-25'
  }
];

export async function seedDatabaseIfEmpty() {
  const playerCount = await db.players.count();
  if (playerCount === 0) {
    const now = new Date().toISOString();
    
    // Insert players
    const playerIds = await db.players.bulkAdd(
      INITIAL_PLAYERS.map(p => ({
        ...p,
        createdAt: now
      })),
      { allKeys: true }
    );

    // Insert tournaments
    const tournamentIds = await db.tournaments.bulkAdd(
      INITIAL_TOURNAMENTS.map(t => ({
        ...t,
        createdAt: now
      })),
      { allKeys: true }
    );

    // Register all 8 players into the first tournament
    if (tournamentIds.length > 0 && playerIds.length >= 8) {
      const firstTournamentId = tournamentIds[0];
      const registrations = playerIds.map(pId => ({
        tournamentId: firstTournamentId,
        playerId: pId,
        registeredAt: now
      }));
      await db.tournament_players.bulkAdd(registrations);
    }
  }
}

export async function resetDatabase() {
  await db.matches.clear();
  await db.tournament_players.clear();
  await db.tournaments.clear();
  await db.players.clear();
  await seedDatabaseIfEmpty();
}
