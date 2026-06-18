import { Injectable, signal } from '@angular/core';

export interface QuoteDetails {
  tier: string;
  users: number;
  modules: string[];
  pricePerUser: number;
  priceTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  activeModal = signal<'freetrial' | 'demo' | 'sales' | 'quote' | null>(null);
  quoteData = signal<QuoteDetails | null>(null);
  signupConfirmEmail = signal<string | null>(null);

  openModal(type: 'freetrial' | 'demo' | 'sales' | 'quote'): void {
    this.activeModal.set(type);
  }

  /** Open the free trial modal directly at the form phase (after email confirmation) */
  openFreeTrialForm(email: string): void {
    this.signupConfirmEmail.set(email);
    this.activeModal.set('freetrial');
  }

  closeModal(): void {
    this.activeModal.set(null);
  }
}
