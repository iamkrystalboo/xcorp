import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';

  toastShow = false;
  toastTitle = '';
  toastDesc = '';

  constructor(private router: Router) {}

  handleForgotPassword(event: Event): void {
    event.preventDefault();
    if (!this.email) return;

    this.showToast(
      'Recovery Link Sent!',
      `We have sent verification details to <b>${this.email}</b>. Please check your inbox.`
    );

    this.email = '';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  showToast(title: string, desc: string): void {
    this.toastTitle = title;
    this.toastDesc = desc;
    this.toastShow = true;

    setTimeout(() => {
      this.toastShow = false;
    }, 3000);
  }
}
