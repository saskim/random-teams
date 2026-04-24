import { Component, model } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { type PlayerRating } from '../../db';

@Component({
  selector: 'app-star-rating',
  imports: [MatIconModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  readonly rating = model<PlayerRating>(3);

  stars: PlayerRating[] = [1, 2, 3, 4, 5];

  setRating(rating: PlayerRating) {
    this.rating.set(rating);
  }
}
