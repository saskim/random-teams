import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'players',
    loadComponent: () => import('./players/players.component').then((m) => m.PlayersComponent),
    data: { title: 'Players' },
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then((m) => m.TeamsComponent),
    data: { title: 'Teams' },
  },
  {
    path: 'matches',
    loadComponent: () =>
      import('./tournaments/tournaments.component').then((m) => m.TournamentsComponent),
    data: { title: 'Matches' },
  },
  {
    path: 'scoreboard',
    loadComponent: () =>
      import('./scoreboard/scoreboard.component').then((m) => m.ScoreboardComponent),
    data: { title: 'Scoreboard' },
  },
  { path: '', redirectTo: 'players', pathMatch: 'full' },
];
