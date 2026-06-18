import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  activeTab: 'leadership' | 'product' | 'hr' = 'leadership';

  constructor(
    private modalService: ModalService,
    private router: Router
  ) {}

  switchTab(tab: 'leadership' | 'product' | 'hr'): void {
    this.activeTab = tab;
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openDemo(): void {
    this.modalService.openModal('demo');
  }

  navigateToCEO(): void {
    this.router.navigate(['/solutions/leadership']);
  }

  navigateToPM(): void {
    this.router.navigate(['/solutions/teams']);
  }

  navigateToHR(): void {
    this.router.navigate(['/solutions/hr']);
  }
}
