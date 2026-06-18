import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface FlowStep {
  index: number;
  title: string;
  sub: string;
  status: 'pending' | 'running' | 'done' | 'rejected';
  meta: string;
}

@Component({
  selector: 'app-product-hr',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './product-hr.component.html',
  styleUrl: './product-hr.component.css'
})
export class ProductHrComponent {
  // Balance
  hrBalance = 12;

  // Form Model
  toManager = '';
  ccEmail = '';
  leaveType = 'annual';
  fromDate = '';
  toDate = '';
  period = 'full';
  reason = '';

  // Simulation Status
  isProcessing = false;
  submitButtonText = 'Submit Request';
  showManualActions = false;
  calculatedDays = 0;

  // Step state
  steps: FlowStep[] = [
    { index: 1, title: 'Request submitted', sub: 'Waiting for submission…', status: 'pending', meta: '—' },
    { index: 2, title: 'Policy check', sub: 'Verify balance & blackout dates', status: 'pending', meta: '—' },
    { index: 3, title: 'Manager notified', sub: 'Slack ping to team lead', status: 'pending', meta: '—' },
    { index: 4, title: 'Decision logged', sub: 'Auto-approve if ≤ 2 days', status: 'pending', meta: '—' },
    { index: 5, title: 'Balance updated', sub: 'Calendar synced, payroll flagged', status: 'pending', meta: '—' }
  ];

  // Role Content
  activeRole: 'hr' | 'ceo' | 'lead' = 'hr';
  roleContent = {
    hr: [
      'Close Excel for good — every leave record, timesheet, and balance lives in XCorp',
      'Payroll export ready in one click — accurate, no reconciliation needed',
      'Policy-based auto-approvals cut inbox volume by half',
    ],
    ceo: [
      'Headcount, attendance, and leave balance visible at a glance',
      'HR data connected to project workload — no blind spots across teams',
      'Compliance and attendance records always audit-ready',
    ],
    lead: [
      'Submit leave in 30 seconds — know the result instantly',
      'Check remaining leave balance anytime, no need to ask HR',
      'GPS check-in from anywhere — office or field, one tap done',
    ]
  };

  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openDemo(): void {
    this.modalService.openModal('demo');
  }

  getCalculatedDays(): number {
    if (this.period === 'am' || this.period === 'pm') {
      return 0.5;
    }
    if (!this.fromDate || !this.toDate) return 0;
    const d1 = new Date(this.fromDate);
    const d2 = new Date(this.toDate);
    if (d2 < d1) return 0;

    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  getAvailableText(): string {
    return `${this.hrBalance} days`;
  }

  getIfApprovedText(): string {
    const days = this.getCalculatedDays();
    if (days > 0 && this.leaveType) {
      const newBal = Math.max(0, this.hrBalance - days);
      return `Balance: ${this.hrBalance} → ${newBal} days (-${days}d)`;
    }
    return `Balance: ${this.hrBalance} days`;
  }

  handleCancel(): void {
    this.toManager = '';
    this.ccEmail = '';
    this.leaveType = 'annual';
    this.fromDate = '';
    this.toDate = '';
    this.period = 'full';
    this.reason = '';
    this.resetSteps();
  }

  resetSteps(): void {
    this.showManualActions = false;
    this.isProcessing = false;
    this.submitButtonText = 'Submit Request';
    this.steps = [
      { index: 1, title: 'Request submitted', sub: 'Waiting for submission…', status: 'pending', meta: '—' },
      { index: 2, title: 'Policy check', sub: 'Verify balance & blackout dates', status: 'pending', meta: '—' },
      { index: 3, title: 'Manager notified', sub: 'Slack ping to team lead', status: 'pending', meta: '—' },
      { index: 4, title: 'Decision logged', sub: 'Auto-approve if ≤ 2 days', status: 'pending', meta: '—' },
      { index: 5, title: 'Balance updated', sub: 'Calendar synced, payroll flagged', status: 'pending', meta: '—' }
    ];
  }

  handleSubmit(): void {
    if (!this.toManager) {
      alert('Please specify who to submit this request to');
      return;
    }
    if (!this.leaveType) {
      alert('Please select a leave type');
      return;
    }
    if (!this.fromDate) {
      alert('Please specify a From Date');
      return;
    }
    if (!this.toDate) {
      alert('Please specify a To Date');
      return;
    }

    const d1 = new Date(this.fromDate);
    const d2 = new Date(this.toDate);
    if (d2 < d1) {
      alert('To Date must be on or after From Date');
      return;
    }

    this.calculatedDays = this.getCalculatedDays();
    this.resetSteps();

    this.isProcessing = true;
    this.submitButtonText = 'Processing…';

    const autoApprove = this.calculatedDays <= 2;
    const stamps = ['09:14:02', '09:14:03', '09:14:04', '09:14:05', '09:14:06'];
    const managerLabel = this.toManager === 'pm' ? 'Project Manager' : 'CEO';
    
    const subs = [
      `Submitted to ${managerLabel} · ${this.calculatedDays} day(s) · ${this.leaveType}`,
      'Balance OK · no coverage conflicts detected',
      autoApprove ? 'Auto-routing (policy: ≤ 2 days)' : `Notified ${managerLabel} via inbox`,
      autoApprove ? 'Auto-approved per policy' : 'Pending manager review',
      `Balance: ${this.hrBalance} → ${Math.max(0, this.hrBalance - this.calculatedDays)} days`,
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      // Mark previous step as done
      if (currentStep > 0) {
        this.steps[currentStep - 1].status = 'done';
        this.steps[currentStep - 1].meta = '✓ ' + stamps[currentStep - 1];
      }

      // Finish flow if auto-approve completes all 5 steps
      if (currentStep >= 5) {
        clearInterval(interval);
        this.hrBalance = Math.max(0, this.hrBalance - this.calculatedDays);
        this.isProcessing = false;
        this.submitButtonText = 'Submit Request';
        return;
      }

      // If step 4 (index 3) and not auto-approve, pause for manual action
      if (currentStep === 3 && !autoApprove) {
        clearInterval(interval);
        this.steps[3].status = 'running';
        this.steps[3].sub = subs[3];
        this.steps[3].meta = 'waiting...';
        this.showManualActions = true;
        return;
      }

      // Run next step
      this.steps[currentStep].status = 'running';
      this.steps[currentStep].sub = subs[currentStep];
      this.steps[currentStep].meta = 'running…';
      
      currentStep++;
    }, 750);
  }

  handleManualApprove(): void {
    this.showManualActions = false;
    this.steps[3].status = 'done';
    this.steps[3].meta = '✓ Approved';
    this.steps[3].sub = 'Approved by manager';

    // Transition to step 5
    this.steps[4].status = 'running';
    this.steps[4].sub = `Balance: ${this.hrBalance} → ${Math.max(0, this.hrBalance - this.calculatedDays)} days`;
    this.steps[4].meta = 'running...';

    setTimeout(() => {
      this.steps[4].status = 'done';
      this.steps[4].meta = '✓ 09:14:06';
      this.hrBalance = Math.max(0, this.hrBalance - this.calculatedDays);
      this.isProcessing = false;
      this.submitButtonText = 'Submit Request';
    }, 750);
  }

  handleManualReject(): void {
    this.showManualActions = false;
    this.steps[3].status = 'rejected';
    this.steps[3].meta = '✗ Rejected';
    this.steps[3].sub = 'Rejected by manager';
    
    this.isProcessing = false;
    this.submitButtonText = 'Submit Request';
  }
}
