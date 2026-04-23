import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TeamService } from '../services/team.service';
import { Player, TeamWithRating } from '../db';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-teams',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
})
export class TeamsComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly playerService = inject(PlayerService);

  teams: TeamWithRating[] = [];
  activePlayers: Player[] = [];
  noOfActivePlayers = 0;
  noOfPlayersOnEachTeam = 5;

  get noOfTeamsToGenerate() {
    return Math.floor(this.noOfActivePlayers / this.noOfPlayersOnEachTeam);
  }

  async ngOnInit() {
    this.fetchTeams();
    this.fetchActivePlayers();
  }

  async randomTeams() {
    const initializedTeams = this.initializeTeams();
    const generatedTeams = await this.generateRandomTeams(initializedTeams);
    generatedTeams.forEach((team) => {
      this.teamService.addTeam(team);
    });
    this.fetchTeams();
  }

  async deleteTeam(teamId?: number) {
    if (teamId === undefined) {
      return;
    }
    await this.teamService.deleteTeam(teamId);
    this.fetchTeams();
  }

  async deleteAllTeams() {
    this.teams.forEach(async (team) => {
      await this.teamService.deleteTeam(team.id!);
    });

    this.fetchTeams();
  }

  async updateTeamIsActive(team: TeamWithRating) {
    if (team === undefined || team.id === undefined) {
      return;
    }

    team.isActive = !team.isActive;

    this.teamService.updateTeam(team.id, { isActive: team.isActive });
    this.fetchTeams();
  }

  private async generateRandomTeams(teams: TeamWithRating[]): Promise<TeamWithRating[]> {
    // Sort players by rating and then shuffle groups of similarly ranked players
    const sortedPlayers = this.activePlayers
      .filter((player) => player.isActive)
      .sort((a, b) => b.rating - a.rating);
    // Example: Shuffle every 5 players who are close in ranking
    for (let i = 0; i < sortedPlayers.length; i += 5) {
      const segment = sortedPlayers.slice(i, i + 5);
      this.shuffleArray(segment).forEach((player, j) => (sortedPlayers[i + j] = player));
    }

    sortedPlayers.forEach((player, index) => {
      teams[index % this.noOfTeamsToGenerate].players.push(player);
    });

    return teams;
  }

  private shuffleArray(array: Player[]): Player[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private initializeTeams(): TeamWithRating[] {
    const noOfTeams = this.teams.length;
    return Array.from({ length: this.noOfTeamsToGenerate }, (_, i) => ({
      id: noOfTeams + i + 1,
      name: `Team ${noOfTeams + i + 1}`,
      totalRating: 0,
      averageRating: 0,
      players: [],
      isActive: true,
    }));
  }

  private async fetchTeams() {
    this.teams = await this.teamService.getTeams();
  }

  private async fetchActivePlayers() {
    this.activePlayers = await this.playerService.getActivePlayers();
    this.activePlayers.sort((a, b) => b.rating - a.rating);

    this.noOfActivePlayers = this.activePlayers.length;
  }
}
