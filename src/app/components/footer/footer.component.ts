import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(private modalService: ModalService) {}

  openFreeTrial(event: Event): void {
    event.preventDefault();
    this.modalService.openModal('freetrial');
  }

  openDemo(event: Event): void {
    event.preventDefault();
    this.modalService.openModal('demo');
  }
}
