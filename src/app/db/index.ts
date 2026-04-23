import Dexie, { type Table } from 'dexie';
import { exportDB, type ExportOptions, importInto } from 'dexie-export-import';

export type PlayerRating = 1 | 2 | 3 | 4 | 5;

export interface Player {
  id?: number;
  name: string;
  rating: PlayerRating;
  isActive: boolean;
}

export interface Team {
  id?: number;
  name: string;
  players: Player[];
  isActive: boolean;
}
export type TeamWithRating = Team & { totalRating: number; averageRating: number };

export interface Tournament {
  id?: number;
  title: string;
  done?: boolean;
}

export interface Match {
  id?: number;
  teamId1: number;
  teamId2: number;
  team1Goals: number;
  team2Goals: number;
  winnerTeamId: number;
  tournamentId: number;
  done: boolean;
}

export interface Scoreboard {
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
    super('random-teams');
    this.version(7).stores({
      players: '++id',
      teams: '++id',
      tournaments: '++id',
      matches: '++id',
      scoreboard: '++id',
    });
    this.on('populate', () => this.populate());

    if (navigator.storage?.persist) {
      void navigator.storage.persist();
    }
  }

  async populate() {
    // Nothing here yet
  }

  async resetDatabase() {
    await db.transaction(
      'rw',
      [db.players, db.teams, db.tournaments, db.matches, db.scoreboard],
      async () => {
        await this.players.clear();
        await this.teams.clear();
        await this.tournaments.clear();
        await this.matches.clear();
        await this.scoreboard.clear();
        await this.populate();
      }
    );
  }

  async exportDatabase(options: ExportOptions): Promise<boolean> {
    try {
      const blob = await exportDB(db, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${db.name}.dexie`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting database:', error);
      return false;
    }
  }

  async importDatabase(file: File): Promise<boolean> {
    try {
      await importInto(db, file, {
        clearTablesBeforeImport: true,
        acceptMissingTables: true,
        acceptNameDiff: true,
      });
      return true;
    } catch (error) {
      console.error('Error importing database:', error);
      return false;
    }
  }
}

export const db = new RandomTeamsDB();
