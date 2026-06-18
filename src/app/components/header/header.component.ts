import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeDropdown: 'products' | 'solutions' | null = null;
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeDropdown();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  toggleDropdown(menu: 'products' | 'solutions', event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeDropdown === menu) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = menu;
    }
  }

  openDropdown(menu: 'products' | 'solutions'): void {
    this.activeDropdown = menu;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  openFreeTrial(event: Event): void {
    event.preventDefault();
    this.closeDropdown();
    this.modalService.openModal('freetrial');
  }
}
