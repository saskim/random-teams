import { Injectable } from '@angular/core';
import { Player, db } from '../db';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  async getPlayer(playerId: number): Promise<Player | undefined> {
    return db.players.filter((player) => player.id === playerId).first();
  }

  async getPlayers(): Promise<Player[]> {
    return db.players.toArray();
  }

  async getActivePlayers(): Promise<Player[]> {
    return db.players.filter((player) => player.isActive).toArray();
  }

  async addPlayer(player: Player) {
    await db.players.add(player);
  }

  async updatePlayer(playerId: number, updatedFields: Partial<Player>) {
    await db.players.update(playerId, updatedFields);
  }

  async deletePlayer(playerId: number) {
    await db.players.delete(playerId);
  }

  async persistPlayers(): Promise<boolean | undefined> {
    if ((await db.players.count()) > 0) {
      const options = { skipTables: ['scoreboard', 'matches', 'tournaments', 'teams'] };
      return db.exportDatabase(options);
    }
    return false;
  }

  async restorePlayers(file: File): Promise<boolean> {
    return db.importDatabase(file);
  }
}
