import Dexie from 'dexie';

// Initialize Dexie IndexedDB instance
export class ChessDatabase extends Dexie {
  constructor() {
    super('ChessTournamentDB');
    this.version(1).stores({
      players: '++id, name, rating, title, country, avatar, wins, losses, draws, createdAt',
      tournaments: '++id, name, format, status, maxPlayers, startDate, endDate, createdAt',
      tournament_players: '++id, tournamentId, playerId, [tournamentId+playerId], registeredAt',
      matches: '++id, tournamentId, round, matchNumber, whitePlayerId, blackPlayerId, winnerId, result, status'
    });
  }
}

export const db = new ChessDatabase();

// --- PLAYER CRUD OPERATIONS ---
export const playerService = {
  async getAll() {
    return await db.players.orderBy('rating').reverse().toArray();
  },

  async getById(id) {
    return await db.players.get(Number(id));
  },

  async create(player) {
    const newPlayer = {
      name: player.name.trim(),
      rating: Number(player.rating) || 1200,
      title: player.title || 'Amateur',
      country: player.country || 'International',
      avatar: player.avatar || '♟️',
      bio: player.bio || '',
      wins: Number(player.wins) || 0,
      losses: Number(player.losses) || 0,
      draws: Number(player.draws) || 0,
      createdAt: new Date().toISOString()
    };
    return await db.players.add(newPlayer);
  },

  async update(id, updates) {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.rating !== undefined) cleanUpdates.rating = Number(cleanUpdates.rating);
    if (cleanUpdates.wins !== undefined) cleanUpdates.wins = Number(cleanUpdates.wins);
    if (cleanUpdates.losses !== undefined) cleanUpdates.losses = Number(cleanUpdates.losses);
    if (cleanUpdates.draws !== undefined) cleanUpdates.draws = Number(cleanUpdates.draws);
    return await db.players.update(Number(id), cleanUpdates);
  },

  async delete(id) {
    const numId = Number(id);
    // Remove player registrations in tournaments
    await db.tournament_players.where('playerId').equals(numId).delete();
    // Delete player
    return await db.players.delete(numId);
  }
};

// --- TOURNAMENT CRUD OPERATIONS ---
export const tournamentService = {
  async getAll() {
    return await db.tournaments.orderBy('createdAt').reverse().toArray();
  },

  async getById(id) {
    return await db.tournaments.get(Number(id));
  },

  async create(tournament) {
    const newTournament = {
      name: tournament.name.trim(),
      description: tournament.description || '',
      format: tournament.format || 'Knockout',
      status: tournament.status || 'Upcoming', // 'Upcoming' | 'In Progress' | 'Completed'
      maxPlayers: Number(tournament.maxPlayers) || 8,
      startDate: tournament.startDate || new Date().toISOString().split('T')[0],
      endDate: tournament.endDate || '',
      createdAt: new Date().toISOString()
    };
    return await db.tournaments.add(newTournament);
  },

  async update(id, updates) {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.maxPlayers !== undefined) cleanUpdates.maxPlayers = Number(cleanUpdates.maxPlayers);
    return await db.tournaments.update(Number(id), cleanUpdates);
  },

  async delete(id) {
    const numId = Number(id);
    // Delete matches of tournament
    await db.matches.where('tournamentId').equals(numId).delete();
    // Delete tournament player registrations
    await db.tournament_players.where('tournamentId').equals(numId).delete();
    // Delete tournament
    return await db.tournaments.delete(numId);
  },

  // --- TOURNAMENT PLAYER ROSTER ---
  async getRegisteredPlayers(tournamentId) {
    const registrations = await db.tournament_players.where('tournamentId').equals(Number(tournamentId)).toArray();
    const playerIds = registrations.map(r => r.playerId);
    if (playerIds.length === 0) return [];
    
    const players = await db.players.where('id').anyOf(playerIds).toArray();
    // Retain registration metadata if needed
    return players;
  },

  async addPlayerToTournament(tournamentId, playerId) {
    const tId = Number(tournamentId);
    const pId = Number(playerId);

    const existing = await db.tournament_players
      .where('[tournamentId+playerId]')
      .equals([tId, pId])
      .first();

    if (existing) {
      throw new Error('Player is already registered in this tournament.');
    }

    return await db.tournament_players.add({
      tournamentId: tId,
      playerId: pId,
      registeredAt: new Date().toISOString()
    });
  },

  async removePlayerFromTournament(tournamentId, playerId) {
    const tId = Number(tournamentId);
    const pId = Number(playerId);

    await db.tournament_players
      .where('[tournamentId+playerId]')
      .equals([tId, pId])
      .delete();
  }
};

// --- MATCH CRUD OPERATIONS ---
export const matchService = {
  async getByTournament(tournamentId) {
    return await db.matches.where('tournamentId').equals(Number(tournamentId)).toArray();
  },

  async getByTournamentAndRound(tournamentId, round) {
    return await db.matches
      .where('tournamentId')
      .equals(Number(tournamentId))
      .filter(m => m.round === Number(round))
      .toArray();
  },

  async createMatch(match) {
    return await db.matches.add({
      tournamentId: Number(match.tournamentId),
      round: Number(match.round) || 1,
      matchNumber: Number(match.matchNumber) || 1,
      whitePlayerId: match.whitePlayerId ? Number(match.whitePlayerId) : null,
      blackPlayerId: match.blackPlayerId ? Number(match.blackPlayerId) : null,
      winnerId: match.winnerId !== undefined && match.winnerId !== null ? Number(match.winnerId) : null,
      result: match.result || 'Pending', // 'Pending' | '1-0' | '0-1' | '1/2-1/2'
      status: match.status || 'Scheduled', // 'Scheduled' | 'Completed'
      completedAt: match.completedAt || null
    });
  },

  async updateResult(matchId, { winnerId, result }) {
    return await db.matches.update(Number(matchId), {
      winnerId: winnerId !== null && winnerId !== undefined ? Number(winnerId) : null,
      result: result,
      status: 'Completed',
      completedAt: new Date().toISOString()
    });
  },

  async clearMatches(tournamentId) {
    return await db.matches.where('tournamentId').equals(Number(tournamentId)).delete();
  }
};
