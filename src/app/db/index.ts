import Dexie, { Table } from 'dexie';

export type PlayerRating = 1 | 2 | 3 | 4 | 5;

export type Player = {
  id?: number;
  name: string;
  rating: PlayerRating;
  isActive: boolean;
}

export type Team = {
  id?: number;
  name: string;
  players: Player[];
  isActive: boolean;
}
export type TeamWithRating = Team & { totalRating: number, averageRating: number };

export type Tournament = {
  id?: number;
  title: string;
  done?: boolean;
}

export type Match = {
  id?: number;
  teamId1: number;
  teamId2: number;
  team1Goals: number;
  team2Goals: number;
  winnerTeamId: number;
  tournamentId: number;
  done: boolean;
}

export type Scoreboard = {
  id?: number;
  playerId: number;
  tournamentId: number;
  matchId: number;
  points: number;
}

export class RandomTeamsDB extends Dexie {
  players!: Table<Player, number>;
  teams!: Table<Team, number>;
  tournaments!: Table<Tournament, number>;
  matches!: Table<Match, number>;
  scoreboard!: Table<Scoreboard, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(6).stores({
      players: '++id',
      teams: '++id',
      tournaments: '++id',
      matches: '++id',
      scoreboard: '++id',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
  }


  async resetDatabase() {
    await db.transaction('rw', 'players', 'teams', 'tournaments', 'matches', 'scoreboard', () => {
      this.players.clear();
      this.teams.clear();
      this.tournaments.clear();
      this.matches.clear();
      this.scoreboard.clear();
      this.populate();
    });
  }
}

export const db = new RandomTeamsDB();
