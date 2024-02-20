import { Component, signal } from '@angular/core';
import { Player, PlayerRating } from '../db';
import { PlayerService } from '../services/player.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StarRatingComponent } from "./star-rating/star-rating.component";

export type Field = 'name' | 'rating' | 'isActive';

@Component({
  selector: 'app-players',
  standalone: true,
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
    StarRatingComponent
  ],
})
export class PlayersComponent {
  newPlayerName: string = '';
  newPlayerRanking: PlayerRating = 3;
  players: Player[] = [];

  sortByField: Field = 'name';

  noOfActivePlayers = signal(0);
  noOfPlayers = signal(0);

  constructor(private playerService: PlayerService) {}


  async ngOnInit() {
    this.fetchPlayers();
    this.sortBy('name');
  }

  addPlayer() {
    const newPlayer: Player = {
      name: this.newPlayerName,
      rating: this.newPlayerRanking,
      isActive: true,
    };
    this.playerService.addPlayer(newPlayer);
    this.newPlayerName = '';
    this.fetchPlayers();
  }

  deletePlayer(playerId?: number) {
    if (playerId === undefined) {
      return;
    }
    this.playerService.deletePlayer(playerId);
    this.fetchPlayers();
  }

  updatePlayerIsActive(player: Player) {
    if (player === undefined || player.id === undefined) {
      return;
    }
    player.isActive = !player.isActive;

    this.playerService.updatePlayer(player.id, { 'isActive': player.isActive });
    this.fetchPlayers();
  }

  updatePlayerRating(player: Player, newRating: PlayerRating) {
    if (player === undefined || player.id === undefined) {
      return;
    }
    player.rating = newRating;
    this.playerService.updatePlayer(player.id, { 'rating': newRating });
    this.fetchPlayers();
  }

  sortBy(field: Field) {
    this.sortByField = field;
    switch (field) {
      case 'name':
        this.players.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        this.players.sort((a, b) => b.rating - a.rating);
        break;
      case 'isActive':
        this.players.sort((a, b) => (b.isActive === a.isActive) ? 0 : b.isActive ? -1 : 1);
        break;
    }
  }

  private async fetchPlayers() {
    this.players = await this.playerService.getPlayers();
    this.noOfPlayers.set(this.players.length);
    this.noOfActivePlayers.set(this.players.filter((player) => player.isActive).length);
  }
}
