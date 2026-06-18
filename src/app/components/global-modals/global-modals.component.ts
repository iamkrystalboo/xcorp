import { Component, effect } from '@angular/core';
import { NgIf, NgClass, NgFor, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-global-modals',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, UpperCasePipe, FormsModule],
  templateUrl: './global-modals.component.html',
  styleUrl: './global-modals.component.css'
})
export class GlobalModalsComponent {
  // Email step flow state
  emailStepPhase: 'email' | 'confirmation' | 'form' = 'email';
  businessEmail = '';

  // Form models
  freeTrialData = {
    orgName: '',
    companyType: 'company',
    companyDomain: '',
    companySize: '',
    country: '',
    timezone: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: ''
  };

  demoData = {
    firstName: '',
    lastName: '',
    workEmail: '',
    company: '',
    teamSize: ''
  };

  salesData = {
    firstName: '',
    lastName: '',
    workEmail: '',
    company: ''
  };

  quoteFormData = {
    name: '',
    email: '',
    company: ''
  };

  // State for success feedback
  showSuccess = false;
  successTitle = '';
  successDesc = '';

  // Multi-step form state
  currentStep = 1;

  constructor(public modalService: ModalService) {
    // Watch for email confirmation (from /signup/confirm route)
    effect(() => {
      const confirmedEmail = this.modalService.signupConfirmEmail();
      if (confirmedEmail && this.modalService.activeModal() === 'freetrial') {
        this.businessEmail = confirmedEmail;
        this.emailStepPhase = 'form';
      }
    });
  }

  close(): void {
    this.modalService.closeModal();
    this.showSuccess = false;
    this.currentStep = 1; // Reset step on close
    this.emailStepPhase = 'email'; // Reset email flow
    this.businessEmail = '';
    this.modalService.signupConfirmEmail.set(null);
  }

  nextStep(): void {
    if (this.currentStep < 2 && this.isCompanyStepValid()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  setStep(step: number): void {
    if (step === 1 || (step === 2 && this.isCompanyStepValid())) {
      this.currentStep = step;
    }
  }

  handleEmailSubmit(event: Event): void {
    event.preventDefault();
    if (this.businessEmail) {
      this.emailStepPhase = 'confirmation';
    }
  }

  isCompanyStepValid(): boolean {
    return !!this.freeTrialData.orgName && !!this.freeTrialData.companyDomain;
  }

  handleFreeTrialSubmit(event: Event): void {
    event.preventDefault();
    this.successTitle = 'Account Created Successfully!';
    this.successDesc = `Your trial workspace ${this.freeTrialData.companyDomain || 'workspace'}.xcorp.app is ready. Welcome to xcorp, ${this.freeTrialData.firstName}!`;
    this.showSuccess = true;
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      this.close();
    }, 4000);
  }

  handleScheduleDemoSubmit(event: Event): void {
    event.preventDefault();
    this.successTitle = 'Demo Booked!';
    this.successDesc = `Thank you, ${this.demoData.firstName}. We've sent a calendar invitation to ${this.demoData.workEmail} to confirm your demo.`;
    this.showSuccess = true;

    setTimeout(() => {
      this.close();
    }, 4000);
  }

  handleContactSalesSubmit(event: Event): void {
    event.preventDefault();
    this.successTitle = 'We\'ve received your information!';
    this.successDesc = `Thank you, ${this.salesData.firstName}. Our team will get back to you at ${this.salesData.workEmail} within the next 24 hours.`;
    this.showSuccess = true;

    setTimeout(() => {
      this.close();
    }, 5000);
  }

  handleQuoteSubmit(event: Event): void {
    event.preventDefault();
    this.successTitle = 'Quote request received!';
    this.successDesc = `Thank you, ${this.quoteFormData.name}. We\'ve noted your selected configuration. Our sales team will review it and reach out to you at ${this.quoteFormData.email} within the next 24 hours.`;
    this.showSuccess = true;

    // Reset Form
    this.quoteFormData = { name: '', email: '', company: '' };

    setTimeout(() => {
      this.close();
    }, 5000);
  }
}
