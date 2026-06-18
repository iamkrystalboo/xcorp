import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { GlobalModalsComponent } from './components/global-modals/global-modals.component';
import { SEOService } from './services/seo.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, HeaderComponent, FooterComponent, GlobalModalsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit {
  showFooter = true;

  constructor(
    private seoService: SEOService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize dynamic SEO manager
    this.seoService.init();

    // Hide footer on authentication pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const hideOn = ['/login', '/signup', '/forgot-password'];
      this.showFooter = !hideOn.some(path => url.includes(path));
    });
  }
}
