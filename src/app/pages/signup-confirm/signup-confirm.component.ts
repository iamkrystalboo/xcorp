import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-signup-confirm',
  standalone: true,
  template: '',
})
export class SignupConfirmComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    if (email && token) {
      // Navigate to home first, then open the modal at form phase
      this.router.navigate(['/home']).then(() => {
        this.modalService.openFreeTrialForm(email);
      });
    } else {
      // Invalid link, redirect to home
      this.router.navigate(['/home']);
    }
  }
}
