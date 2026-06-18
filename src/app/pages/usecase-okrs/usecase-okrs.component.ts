import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-usecase-okrs',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './usecase-okrs.component.html',
  styleUrl: './usecase-okrs.component.css'
})
export class UsecaseOkrsComponent {
  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }
}
