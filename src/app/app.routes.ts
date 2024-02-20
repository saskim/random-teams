import { Routes } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { TeamsComponent } from './teams/teams.component';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';

export const routes: Routes = [
  {
    path: 'players',
    component: PlayersComponent,
    data: { title: 'Players' }
  },
  {
    path: 'teams',
    component: TeamsComponent,
    data: { title: 'Teams' }
  },
  {
    path: 'matches',
    component: TournamentsComponent,
    data: { title: 'Matches' }
  },
  {
    path: 'scoreboard',
    component: ScoreboardComponent,
    data: { title: 'Scoreboard' }
  },
  { path: '', redirectTo: 'players', pathMatch: 'full' },
];
