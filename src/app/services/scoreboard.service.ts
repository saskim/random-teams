import { Injectable } from '@angular/core';

import { db,type Scoreboard } from '../db';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  async getMatchScoreboard(tournamentId: number, matchId: number): Promise<Scoreboard[]> {
    return await db.scoreboard
      .filter(
        (scoreboard) => scoreboard.tournamentId === tournamentId && scoreboard.matchId === matchId
      )
      .toArray();
  }
  async getTournamentScoreboard(tournamentId: number): Promise<Scoreboard[]> {
    return db.scoreboard.filter((scoreboard) => scoreboard.tournamentId === tournamentId).toArray();
  }

  async addScoreboardEntry(scoreboard: Scoreboard) {
    await db.scoreboard.add(scoreboard);
  }

  async updateScoreboardEntry(scoreboardId: number, updatedFields: Partial<Scoreboard>) {
    await db.scoreboard.update(scoreboardId, updatedFields);
  }

  async clearScoreboard() {
    await db.scoreboard.clear();
  }
}
