import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  init(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary')
    ).subscribe(route => {
      // Update Title
      const title = route.snapshot.data['title'] || 'xcorp — Products & Solutions';
      this.titleService.setTitle(title);

      // Update Meta Description
      const description = route.snapshot.data['description'] || 'One system for every team. Replaces app chaos with a single, clear command center.';
      this.metaService.updateTag({ name: 'description', content: description });
    });
  }
}
