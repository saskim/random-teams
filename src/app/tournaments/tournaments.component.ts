
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Match, Scoreboard, Team, Tournament } from '../db';
import { TournamentService } from '../services/tournament.service';
import { TeamService } from '../services/team.service';
import { MatchService } from '../services/match.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResultDialogComponent, ResultDialogData } from './result-dialog/result-dialog.component';
import { ScoreboardService } from '../services/scoreboard.service';

export type PrintableMatch = {
  id?: number
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
    FormsModule
],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss'
})
export class TournamentsComponent {
  teams: Team[] = [];
  tournaments: Tournament[] = [];
  matches: Match[] = [];

  printableMatches = signal<PrintableMatch[]>([]);
  noOfActiveTeams = signal(0);

  noOfMatches = signal(0);
  noOfRemainingMatches = signal(0);

  constructor(
    public dialog: MatDialog,
    private tournamentService: TournamentService,
    private teamService: TeamService,
    private matchService: MatchService,
    private scoreboardService: ScoreboardService,
  ) {}

  async ngOnInit() {
    this.fetchTeams();
    this.fetchTournaments();
    this.fetchMatches();
  }

  async openResultDialog(printableMatch: PrintableMatch) {
    const match = this.matches.find(match => match.id === printableMatch.id);
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

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);

      if (result !== false) {
        this.updateResult(result);
      }
    });
  }

  async updateResult(result?: ResultDialogData) {
    if (result === undefined || result.matchId === undefined) {
      return;
    }

    let winnerTeamId = -1;
    if (result.done) {
      if (result.team1Goals === result.team2Goals) {
        winnerTeamId = 0;
      }
      else {
        winnerTeamId = result.team1Goals > result.team2Goals ? result.team1Id : result.team2Id;
      }
    }

    await this.matchService.updateMatch(result.matchId, {
      'winnerTeamId': winnerTeamId,
      'done': result.done,
      'team1Goals': result.team1Goals,
      'team2Goals': result.team2Goals,
    });


    this.registerToScoreboard(result, winnerTeamId);

    this.fetchTournaments();
  }

  private async registerToScoreboard(result: ResultDialogData, winnerTeamId: number) {
    const team1 = this.teams.find(team => team.id === result.team1Id);
    const team2 = this.teams.find(team => team.id === result.team2Id);
    if (team1 === undefined || team2 === undefined) {
      return;
    }

    const matchScoreboards = await this.scoreboardService.getMatchScoreboard(result.tournamentId, result.matchId);
    if (matchScoreboards === undefined || matchScoreboards.length === 0) {
      this.addToScoreboard(result, team1, winnerTeamId);
      this.addToScoreboard(result, team2, winnerTeamId);
    }
    else {
      this.updateScoreboard(matchScoreboards, team1, winnerTeamId);
      this.updateScoreboard(matchScoreboards, team2, winnerTeamId);
    }
  }

  private addToScoreboard(result: ResultDialogData, team: Team, winnerTeamId: number) {
    const points = team.id === winnerTeamId ? 3 : winnerTeamId === 0 ? 1 : 0;
    team.players.forEach(player => {
      this.scoreboardService.addScoreboardEntry({
        'tournamentId': result.tournamentId,
        'matchId': result.matchId,
        'playerId': player.id!,
        'points': points,
      });
    });
  }

  private updateScoreboard(matchScoreboards: Scoreboard[], team: Team, winnerTeamId: number) {
    const points = team.id === winnerTeamId ? 3 : winnerTeamId === 0 ? 1 : 0;
    matchScoreboards.forEach(matchScoreboard => {
      this.scoreboardService.updateScoreboardEntry(matchScoreboard.id!, {
        'points': points,
      });
    });
  }

  async createTournament() {
    let tournament;
    let tournamentId;
    if (this.tournaments.length === 0) {
      const newTournament: Tournament = {
        id: 1,
        title: `Tournament`,
        done: false,
      };
      tournamentId = await this.tournamentService.addTournament(newTournament);
      tournament = newTournament;
    }
    else {
      tournament = this.tournaments[0];
      tournamentId = tournament.id!;
    }

    const matches = this.generateMatches(tournamentId);
    for (const match of matches) {
      await this.matchService.addMatch(match);
    }

    this.fetchTournaments();
  }

  async deleteTournament(tournamentId?: number) {
    if (tournamentId === undefined) {
      return;
    }
    await this.tournamentService.deleteTournament(tournamentId);

    this.fetchTournaments();
  }
  async deleteAllTournaments() {
    this.tournaments.forEach(async (tournament) => {
      await this.tournamentService.deleteTournament(tournament.id!);
    })

    this.fetchTournaments();
  }

  private generateMatches(tournamentId: number): Match[] {
    const matches: Match[] = [];

    this.teams.forEach((team1, index1) => {
      this.teams.slice(index1 + 1).forEach((team2, index2) => {
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
    this.fetchMatches();
  }

  private async fetchTeams() {
    this.teams = await this.teamService.getTeams();
    this.noOfActiveTeams.set(this.teams.filter((team) => team.isActive).length);
  }

  private async fetchMatches() {
    this.matches = await this.matchService.getMatches();

    this.printableMatches.set(this.matches.map((match) => {
      const team1 = this.teams.find((team) => team.id === match.teamId1);
      const team2 = this.teams.find((team) => team.id === match.teamId2);
      return {
        id: match.id,
        team1: team1,
        team2: team2,
        team1Goals: match.team1Goals,
        team2Goals: match.team2Goals,
        winnerTeamId: match.winnerTeamId,
        collapsePlayers: true
      };
    }));

    this.noOfMatches.set(this.matches.length);
    this.noOfRemainingMatches.set(this.matches.filter((match) => !match.done).length);
  }
}
