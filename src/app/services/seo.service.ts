import { Injectable, effect, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translationService = inject(TranslationService);

  private currentRouteData: { titleKey: string; defaultTitle: string; descKey: string; defaultDesc: string } | null = null;

  constructor() {
    // Reactively update page headers when language changes
    effect(() => {
      // Access the signal to trigger execution on change
      const lang = this.translationService.currentLang();
      if (this.currentRouteData) {
        const title = this.translationService.translate(this.currentRouteData.titleKey);
        const description = this.translationService.translate(this.currentRouteData.descKey);

        this.titleService.setTitle(title !== this.currentRouteData.titleKey ? title : this.currentRouteData.defaultTitle);
        this.metaService.updateTag({
          name: 'description',
          content: description !== this.currentRouteData.descKey ? description : this.currentRouteData.defaultDesc
        });
      }
    });
  }

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
      const defaultTitle = route.snapshot.data['title'] || 'xcorp — Products & Solutions';
      const defaultDesc = route.snapshot.data['description'] || 'One system for every team. Replaces app chaos with a single, clear command center.';
      
      // Compute path-based keys, e.g. for '/products/okr' path is 'products_okr'
      const url = this.router.url.split('?')[0]; // Remove query params
      const cleanPath = url.replace(/^\/+|\/+$/g, '').replace(/\//g, '_') || 'home';

      this.currentRouteData = {
        titleKey: `routes.${cleanPath}.title`,
        defaultTitle,
        descKey: `routes.${cleanPath}.description`,
        defaultDesc
      };

      // Trigger effect update
      this.translationService.currentLang.set(this.translationService.currentLang());
    });
  }
}
