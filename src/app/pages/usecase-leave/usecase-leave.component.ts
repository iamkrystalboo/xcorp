import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-usecase-leave',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './usecase-leave.component.html',
  styleUrl: './usecase-leave.component.css'
})
export class UsecaseLeaveComponent {
  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }

  approveDemo(): void {
    alert('Demo: Approved request for Trần Ngọc');
  }

  rejectDemo(): void {
    alert('Demo: Rejected request for Trần Ngọc');
  }
}
