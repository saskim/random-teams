import { Injectable } from '@angular/core';
import { Tournament, db } from '../db';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  async getTournament(tournamentId: number): Promise<Tournament | undefined> {
    return await db.tournaments.filter((tournament) => tournament.id === tournamentId).first();
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db.tournaments.toArray();
  }

  async addTournament(tournaments: Tournament): Promise<number> {
    return await db.tournaments.add(tournaments);
  }

  async updateTournament(tournamentId: number, updatedFields: Partial<Tournament>) {
    await db.tournaments.update(tournamentId, updatedFields);
  }

  async deleteTournament(tournamentId: number) {
    await db.tournaments.delete(tournamentId);
    db.matches.filter((match) => match.tournamentId === tournamentId).delete();
  }
}
