import { Component, type ElementRef, inject, type OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { type Match, type Scoreboard, type Team, type Tournament } from '../db';
import { MatchService } from '../services/match.service';
import { ScoreboardService } from '../services/scoreboard.service';
import { TeamService } from '../services/team.service';
import { TournamentService } from '../services/tournament.service';

export interface ResultDialogData {
  tournamentId: number;
  matchId: number;
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
  team1Goals: number;
  team2Goals: number;
  done: boolean;
}

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
  imports: [FormsModule, RouterLink],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss',
})
export class TournamentsComponent implements OnInit {
  private readonly tournamentService = inject(TournamentService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);
  private readonly scoreboardService = inject(ScoreboardService);

  @ViewChild('resultDialogEl') resultDialogEl!: ElementRef<HTMLDialogElement>;

  teams: Team[] = [];
  tournaments: Tournament[] = [];
  matches: Match[] = [];

  printableMatches = signal<PrintableMatch[]>([]);
  noOfActiveTeams = signal(0);
  noOfMatches = signal(0);
  noOfRemainingMatches = signal(0);

  dialogFormData: ResultDialogData | null = null;

  ngOnInit() {
    void this.fetchTeams();
    void this.fetchTournaments();
    void this.fetchMatches();
  }

  openResultDialog(printableMatch: PrintableMatch) {
    const match = this.matches.find((m) => m.id === printableMatch.id);
    if (match === undefined) return;

    this.dialogFormData = {
      tournamentId: match.tournamentId,
      matchId: match.id!,
      team1Id: match.teamId1,
      team2Id: match.teamId2,
      team1Name: printableMatch.team1?.name ?? '',
      team2Name: printableMatch.team2?.name ?? '',
      team1Goals: match.team1Goals,
      team2Goals: match.team2Goals,
      done: true,
    };

    this.resultDialogEl.nativeElement.showModal();
  }

  saveResult() {
    if (!this.dialogFormData) return;
    const data = { ...this.dialogFormData };
    this.closeDialog();
    void this.updateResult(data);
  }

  closeDialog() {
    this.resultDialogEl.nativeElement.close();
    this.dialogFormData = null;
  }

  async createTournament() {
    let tournamentId: number;
    if (this.tournaments.length === 0) {
      const newTournament: Tournament = { id: 1, title: 'Tournament', done: false };
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
    if (tournamentId === undefined) return;
    await this.tournamentService.deleteTournament(tournamentId);
    await this.fetchTournaments();
  }

  async deleteAllTournaments() {
    for (const tournament of this.tournaments) {
      await this.tournamentService.deleteTournament(tournament.id!);
    }
    await this.fetchTournaments();
  }

  private async updateResult(result: ResultDialogData) {
    let winnerTeamId = -1;
    if (result.done) {
      if (result.team1Goals === result.team2Goals) {
        winnerTeamId = 0;
      } else {
        winnerTeamId = result.team1Goals > result.team2Goals ? result.team1Id : result.team2Id;
      }
    }

    await this.matchService.updateMatch(result.matchId, {
      winnerTeamId,
      done: result.done,
      team1Goals: result.team1Goals,
      team2Goals: result.team2Goals,
    });

    await this.registerToScoreboard(result, winnerTeamId);
    await this.fetchTournaments();
  }

  private async registerToScoreboard(result: ResultDialogData, winnerTeamId: number) {
    const team1 = this.teams.find((t) => t.id === result.team1Id);
    const team2 = this.teams.find((t) => t.id === result.team2Id);
    if (!team1 || !team2) return;

    const matchScoreboards = await this.scoreboardService.getMatchScoreboard(
      result.tournamentId,
      result.matchId
    );
    if (!matchScoreboards || matchScoreboards.length === 0) {
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
        points,
      });
    });
  }

  private updateScoreboard(matchScoreboards: Scoreboard[], team: Team, winnerTeamId: number) {
    const points = team.id === winnerTeamId ? 3 : winnerTeamId === 0 ? 1 : 0;
    matchScoreboards.forEach((entry) => {
      void this.scoreboardService.updateScoreboardEntry(entry.id!, { points });
    });
  }

  private generateMatches(tournamentId: number): Match[] {
    const matches: Match[] = [];
    this.teams.forEach((team1, index1) => {
      this.teams.slice(index1 + 1).forEach((team2) => {
        matches.push({
          teamId1: team1.id!,
          teamId2: team2.id!,
          team1Goals: 0,
          team2Goals: 0,
          winnerTeamId: -1,
          tournamentId,
          done: false,
        });
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
    this.noOfActiveTeams.set(this.teams.filter((t) => t.isActive).length);
  }

  private async fetchMatches() {
    this.matches = await this.matchService.getMatches();

    this.printableMatches.set(
      this.matches.map((match) => ({
        id: match.id,
        team1: this.teams.find((t) => t.id === match.teamId1),
        team2: this.teams.find((t) => t.id === match.teamId2),
        team1Goals: match.team1Goals,
        team2Goals: match.team2Goals,
        winnerTeamId: match.winnerTeamId,
        collapsePlayers: true,
      }))
    );

    this.noOfMatches.set(this.matches.length);
    this.noOfRemainingMatches.set(this.matches.filter((m) => !m.done).length);
  }
}
