import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  toastShow = false;
  toastTitle = '';
  toastDesc = '';

  constructor(private router: Router, public modalService: ModalService) {}

  handleLogin(event: Event): void {
    event.preventDefault();
    if (!this.email || !this.password) return;

    this.showToast(
      'Sign In Successful!',
      'Welcome back to your XCorp command center. Redirecting...'
    );

    setTimeout(() => {
      this.router.navigate(['/products/okr']);
    }, 2000);
  }

  handleGoogleSignIn(): void {
    alert('Sign in with Google! In a real app, this would trigger Google OAuth.');
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
