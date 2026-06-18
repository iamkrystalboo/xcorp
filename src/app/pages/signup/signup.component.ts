import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  orgName = '';
  companyType = 'company';
  companyDomain = '';
  companySize = '';
  country = '';
  timezone = '';
  firstName = '';
  lastName = '';
  phone = '';
  password = '';

  toastShow = false;
  toastTitle = '';
  toastDesc = '';

  constructor(private router: Router) {}

  handleSignup(event: Event): void {
    event.preventDefault();
    if (!this.orgName || !this.companyDomain || !this.firstName || !this.lastName || !this.password) return;

    this.showToast(
      'Account Created!',
      `Welcome to XCorp! We have sent a verification link to <b>${this.firstName}.${this.lastName}@${this.companyDomain}.com</b> (simulated). Please check your inbox.`
    );

    setTimeout(() => {
      this.router.navigate(['/products/okr']);
    }, 2500);
  }

  handleGoogleSignUp(): void {
    alert('Sign up with Google! In a real app, this would trigger Google OAuth.');
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
