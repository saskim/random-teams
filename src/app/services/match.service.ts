import { Injectable } from '@angular/core';

import { db,type Match } from '../db';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  async getMatches(): Promise<Match[]> {
    return await db.matches.toArray();
  }

  async addMatch(matches: Match) {
    await db.matches.add(matches);
  }

  async updateMatch(matchId: number, updatedFields: Partial<Match>) {
    await db.matches.update(matchId, updatedFields);
  }

  async deleteMatch(matchId: number) {
    await db.matches.delete(matchId);
  }
}
