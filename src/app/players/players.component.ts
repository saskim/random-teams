import { Component, inject,type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { type Player, type PlayerRating } from '../db';
import { PlayerService } from '../services/player.service';
import { StarRatingComponent } from './star-rating/star-rating.component';

export type Field = 'name' | 'rating' | 'isActive';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
    StarRatingComponent,
  ],
})
export class PlayersComponent implements OnInit {
  private readonly playerService = inject(PlayerService);

  newPlayerName = '';
  newPlayerRanking: PlayerRating = 3;
  players: Player[] = [];

  sortByField: Field = 'name';

  noOfActivePlayers = signal(0);
  noOfPlayers = signal(0);
  message = signal('You can save players to a file so you can restore them later');
  error = signal('');

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
    if (player?.id === undefined) {
      return;
    }
    player.isActive = !player.isActive;

    this.playerService.updatePlayer(player.id, { isActive: player.isActive });
    this.fetchPlayers();
  }

  updatePlayerRating(player: Player, newRating: PlayerRating) {
    if (player?.id === undefined) {
      return;
    }
    player.rating = newRating;
    this.playerService.updatePlayer(player.id, { rating: newRating });
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
        this.players.sort((a, b) => (b.isActive === a.isActive ? 0 : b.isActive ? -1 : 1));
        break;
    }
  }

  async persistPlayers() {
    this.message.set('');
    this.error.set('');
    const success = await this.playerService.persistPlayers();
    if (success) {
      this.message.set(`Players successfully saved to file 'random-teams.dexie'`);
    } else {
      this.error.set('Could not save players to file');
    }
  }

  async restorePlayers(event: Event) {
    this.message.set('');
    this.error.set('');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const success = await this.playerService.restorePlayers(file);
      if (success) {
        this.fetchPlayers();
      } else {
        this.error.set('Could not restore players');
      }
    }
  }

  private async fetchPlayers() {
    this.players = await this.playerService.getPlayers();
    this.noOfPlayers.set(this.players.length);
    this.noOfActivePlayers.set(this.players.filter((player) => player.isActive).length);

    this.message.set('');
    this.error.set('');
  }
}
