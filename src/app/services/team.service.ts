import { Injectable } from '@angular/core';

import { db,type Team, type TeamWithRating } from '../db';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  async getTeams(): Promise<TeamWithRating[]> {
    const teams = await db.teams.toArray();

    const teamsWithRating: TeamWithRating[] = teams.map((team) => {
      const totalRating = team.players
        .map((player) => player.rating)
        .reduce((acc, cur) => acc + cur, 0);
      return {
        ...team,
        totalRating: totalRating,
        averageRating: Math.round((totalRating / team.players.length) * 100) / 100,
      };
    });
    return teamsWithRating;
  }

  async addTeam(team: Team) {
    await db.teams.add(team);
  }

  async updateTeam(teamId: number, updatedFields: Partial<Team>) {
    await db.teams.update(teamId, updatedFields);
  }

  async deleteTeam(teamId: number) {
    await db.teams.delete(teamId);
  }
}
