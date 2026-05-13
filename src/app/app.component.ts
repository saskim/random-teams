import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';

import { APP_VERSION } from './app-version';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  title = '';
  version = APP_VERSION ?? '1.0.0';
  isDarkMode = false;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data),
        map((data) => {
          const title: unknown = data['title'];
          return typeof title === 'string' ? title : '';
        })
      )
      .subscribe((title) => {
        this.title = title;
        this.titleService.setTitle(title);
      });

    // Sync isDarkMode with the class set by the inline <script> in index.html
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}
