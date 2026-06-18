import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-all-features',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './all-features.component.html',
  styleUrl: './all-features.component.css'
})
export class AllFeaturesComponent {
  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }
}
