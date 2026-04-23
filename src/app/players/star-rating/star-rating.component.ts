import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { type PlayerRating } from '../../db';

@Component({
  selector: 'app-star-rating',
  imports: [MatInputModule, MatFormFieldModule, MatIconModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {
  @Input() rating: PlayerRating = 3;
  @Output() ratingChange = new EventEmitter<PlayerRating>();

  stars: PlayerRating[] = [1, 2, 3, 4, 5];


  setRating(rating: PlayerRating) {
    this.rating = rating;
    this.ratingChange.emit(this.rating);
  }
}
