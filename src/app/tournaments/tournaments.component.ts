import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { type Match, type Scoreboard, type Team, type Tournament } from '../db';
import { MatchService } from '../services/match.service';
import { ScoreboardService } from '../services/scoreboard.service';
import { TeamService } from '../services/team.service';
import { TournamentService } from '../services/tournament.service';
import {
  ResultDialogComponent,
  type ResultDialogData,
} from './result-dialog/result-dialog.component';

export interface PrintableMatch {
  id?: number;
  team1?: Team;
  team2?: Team;
  team1Goals: number;
  team2Goals: number;
  winnerTeamId: number;
  collapsePlayers: boolean;
}

@Component({
  selector: 'app-tournaments',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss',
})
export class TournamentsComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly tournamentService = inject(TournamentService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);
  private readonly scoreboardService = inject(ScoreboardService);

  teams: Team[] = [];
  tournaments: Tournament[] = [];
  matches: Match[] = [];

  printableMatches = signal<PrintableMatch[]>([]);
  noOfActiveTeams = signal(0);

  noOfMatches = signal(0);
  noOfRemainingMatches = signal(0);

  ngOnInit() {
    void this.fetchTeams();
    void this.fetchTournaments();
    void this.fetchMatches();
  }

  openResultDialog(printableMatch: PrintableMatch) {
    const match = this.matches.find((match) => match.id === printableMatch.id);
    if (match === undefined) {
      return;
    }
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      data: {
        tournamentId: match.tournamentId,
        matchId: match.id,
        team1Id: match.teamId1,
        team2Id: match.teamId2,
        team1Name: printableMatch.team1?.name,
        team2Name: printableMatch.team2?.name,
        team1Goals: match.team1Goals,
        team2Goals: match.team2Goals,
        done: match.done,
      },
    });

    dialogRef.afterClosed().subscribe((result: ResultDialogData | false | undefined) => {
      console.log('The dialog was closed', result);

      if (result !== false) {
        void this.updateResult(result);
      }
    });
  }

  async updateResult(result?: ResultDialogData) {
    if (result?.matchId === undefined) {
      return;
    }

    let winnerTeamId = -1;
    if (result.done) {
      if (result.team1Goals === result.team2Goals) {
        winnerTeamId = 0;
      } else {
        winnerTeamId = result.team1Goals > result.team2Goals ? result.team1Id : result.team2Id;
      }
    }

    await this.matchService.updateMatch(result.matchId, {
      winnerTeamId: winnerTeamId,
      done: result.done,
      team1Goals: result.team1Goals,
      team2Goals: result.team2Goals,
    });

    await this.registerToScoreboard(result, winnerTeamId);

    await this.fetchTournaments();
  }

  async createTournament() {
    let tournamentId;
    if (this.tournaments.length === 0) {
      const newTournament: Tournament = {
        id: 1,
        title: `Tournament`,
        done: false,
      };
      tournamentId = await this.tournamentService.addTournament(newTournament);
    } else {
      tournamentId = this.tournaments[0].id!;
    }

    const matches = this.generateMatches(tournamentId);
    for (const match of matches) {
      await this.matchService.addMatch(match);
    }

    await this.fetchTournaments();
  }

  async deleteTournament(tournamentId?: number) {
    if (tournamentId === undefined) {
      return;
    }
    await this.tournamentService.deleteTournament(tournamentId);

    await this.fetchTournaments();
  }

  async deleteAllTournaments() {
    for (const tournament of this.tournaments) {
      await this.tournamentService.deleteTournament(tournament.id!);
    }
    await this.fetchTournaments();
  }

  private async registerToScoreboard(result: ResultDialogData, winnerTeamId: number) {
    const team1 = this.teams.find((team) => team.id === result.team1Id);
    const team2 = this.teams.find((team) => team.id === result.team2Id);
    if (team1 === undefined || team2 === undefined) {
      return;
    }

    const matchScoreboards = await this.scoreboardService.getMatchScoreboard(
      result.tournamentId,
      result.matchId
    );
    if (matchScoreboards === undefined || matchScoreboards.length === 0) {
      this.addToScoreboard(result, team1, winnerTeamId);
      this.addToScoreboard(result, team2, winnerTeamId);
    } else {
      this.updateScoreboard(matchScoreboards, team1, winnerTeamId);
      this.updateScoreboard(matchScoreboards, team2, winnerTeamId);
    }
  }

  private addToScoreboard(result: ResultDialogData, team: Team, winnerTeamId: number) {
    const points = team.id === winnerTeamId ? 3 : winnerTeamId === 0 ? 1 : 0;
    team.players.forEach((player) => {
      void this.scoreboardService.addScoreboardEntry({
        tournamentId: result.tournamentId,
        matchId: result.matchId,
        playerId: player.id!,
        points: points,
      });
    });
  }

  private updateScoreboard(matchScoreboards: Scoreboard[], team: Team, winnerTeamId: number) {
    const points = team.id === winnerTeamId ? 3 : winnerTeamId === 0 ? 1 : 0;
    matchScoreboards.forEach((matchScoreboard) => {
      void this.scoreboardService.updateScoreboardEntry(matchScoreboard.id!, {
        points: points,
      });
    });
  }

  private generateMatches(tournamentId: number): Match[] {
    const matches: Match[] = [];

    this.teams.forEach((team1, index1) => {
      this.teams.slice(index1 + 1).forEach((team2) => {
        const match: Match = {
          teamId1: team1.id!,
          teamId2: team2.id!,
          team1Goals: 0,
          team2Goals: 0,
          winnerTeamId: -1,
          tournamentId,
          done: false,
        };
        matches.push(match);
      });
    });

    return matches;
  }

  private async fetchTournaments() {
    this.tournaments = await this.tournamentService.getTournaments();
    await this.fetchMatches();
  }

  private async fetchTeams() {
    this.teams = await this.teamService.getTeams();
    this.noOfActiveTeams.set(this.teams.filter((team) => team.isActive).length);
  }

  private async fetchMatches() {
    this.matches = await this.matchService.getMatches();

    this.printableMatches.set(
      this.matches.map((match) => {
        const team1 = this.teams.find((team) => team.id === match.teamId1);
        const team2 = this.teams.find((team) => team.id === match.teamId2);
        return {
          id: match.id,
          team1: team1,
          team2: team2,
          team1Goals: match.team1Goals,
          team2Goals: match.team2Goals,
          winnerTeamId: match.winnerTeamId,
          collapsePlayers: true,
        };
      })
    );

    this.noOfMatches.set(this.matches.length);
    this.noOfRemainingMatches.set(this.matches.filter((match) => !match.done).length);
  }
}
