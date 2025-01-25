import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerRating } from '../../db';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-star-rating',
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatIconModule],
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
