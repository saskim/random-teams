import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { ScoreboardService } from '../services/scoreboard.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Player } from '../db';

export interface PlayerScoreboard { playerId: number, playerName: string, points: number }

@Component({
  selector: 'app-scoreboard',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements OnInit {
  playerScoreboard: PlayerScoreboard[] = [];
  private players: Player[] = [];

  constructor(private scoreboardService: ScoreboardService, private playerService: PlayerService) {}

  async ngOnInit() {
    this.fetchPlayers();
    this.fetchScoreboards();
  }

  async clearScoreboard() {
    await this.scoreboardService.clearScoreboard();
    this.fetchScoreboards();
  }

  private async fetchScoreboards() {
    this.playerScoreboard = [];
    const scoreboards = await this.scoreboardService.getTournamentScoreboard(1);
    if (scoreboards.length === 0) {
      return;
    }

    scoreboards.forEach((scoreboard) => {
      const playerName = this.getPlayerName(scoreboard.playerId);
      const currentPlayerScoreboard = this.playerScoreboard.find(ps => ps.playerId === scoreboard.playerId);
      if (currentPlayerScoreboard === undefined) {
        this.playerScoreboard.push({ playerId: scoreboard.playerId, playerName: playerName, points: scoreboard.points });
      }
      else {
        currentPlayerScoreboard.points += scoreboard.points;
      }
    });

    this.playerScoreboard.sort((a, b) => b.points - a.points);
  }

  private getPlayerName(playerId: number) {
    const player = this.players.find((player) => player.id === playerId);
    return player?.name || 'Unknown';
  }

  private async fetchPlayers() {
    this.players = await this.playerService.getPlayers();
  }
}
