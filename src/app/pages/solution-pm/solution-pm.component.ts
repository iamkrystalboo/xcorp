import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface PMCard {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'doing' | 'blocked' | 'done';
  due: string;
  isBalanced?: boolean;
}

interface SandboxEvent {
  time: string;
  text: string;
}

@Component({
  selector: 'app-solution-pm',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './solution-pm.component.html',
  styleUrl: './solution-pm.component.css'
})
export class SolutionPmComponent {
  pmBalanced = false;
  isInjectDisabled = false;

  pmInitialOwners: Record<string, string> = {
    t1: 'BL',
    t2: 'MH',
    t3: 'TN',
    api: 'TN',
    t4: 'TN',
    t5: 'TN',
    t6: 'MH'
  };

  pmCards: PMCard[] = [
    { id: 't1', title: 'Auth flow refactor', assignee: 'BL', status: 'todo', due: 'Jun 12' },
    { id: 't2', title: 'Settings screen redesign', assignee: 'MH', status: 'todo', due: 'Jun 14' },
    { id: 't3', title: 'Onboarding flow QA', assignee: 'TN', status: 'todo', due: 'Jun 15' },
    { id: 'api', title: 'Payment Gateway API', assignee: 'TN', status: 'blocked', due: 'Jun 10' },
    { id: 't4', title: 'Push notifications', assignee: 'TN', status: 'doing', due: 'Jun 15' },
    { id: 't5', title: 'Analytics dashboard', assignee: 'TN', status: 'doing', due: 'Jun 13' },
    { id: 't6', title: 'Splash screen', assignee: 'MH', status: 'done', due: '—' }
  ];

  // Stats
  statBad = '—';
  statBadLabel = 'Click "Balance" to start';
  statGood = '—';
  statGoodLabel = 'Click "Balance" to start';

  // Event lists
  badEvents: SandboxEvent[] = [];
  goodEvents: SandboxEvent[] = [];

  constructor(private modalService: ModalService) {
    this.resetPmSandbox();
  }

  resetPmSandbox(): void {
    this.pmBalanced = false;
    this.isInjectDisabled = false;

    // Restore initial owners
    this.pmCards.forEach(c => {
      c.assignee = this.pmInitialOwners[c.id];
      c.isBalanced = false;
    });

    this.statBad = '—';
    this.statBadLabel = 'Click "Balance" to start';
    this.statGood = '—';
    this.statGoodLabel = 'Click "Balance" to start';

    this.badEvents = [];
    this.goodEvents = [];
  }

  injectBlocker(): void {
    if (this.pmBalanced) return;
    this.pmBalanced = true;
    this.isInjectDisabled = true;

    // 1. Reassign tasks on the sprint board
    // Move t4 (Push notifications) to BL
    const t4 = this.pmCards.find(c => c.id === 't4');
    if (t4) {
      t4.assignee = 'BL';
      t4.isBalanced = true;
    }

    // Move t5 (Analytics dashboard) to MH
    const t5 = this.pmCards.find(c => c.id === 't5');
    if (t5) {
      t5.assignee = 'MH';
      t5.isBalanced = true;
    }

    // 2. Render stats
    setTimeout(() => {
      this.statBad = '3 hours';
      this.statBadLabel = 'To coordinate manually';
      this.statGood = '10 sec';
      this.statGoodLabel = 'To balance automatically';
    }, 600);

    // 3. Bad events (Manual allocation)
    this.addEvent('bad', 'Now', 'Sprint backlog loaded; Trần Ngọc has 4 active tasks (92% capacity)', 800);
    this.addEvent('bad', '+4h', 'PM reviews Excel sheet to analyze team capacity', 1100);
    this.addEvent('bad', '+1 day', 'Back-and-forth Slack messages to negotiate reassignments', 1400);
    this.addEvent('bad', '+2 days', 'Resource conflicts resolved manually after 3 meetings', 1700);
    this.addEvent('bad', '+1 wk', 'Overloaded engineer burns out; sprint slips anyway', 2000);

    // 4. Good events (XCorp Auto-Balance)
    this.addEvent('good', 'Now', 'XCorp detects Trần Ngọc overload at 92% capacity', 800);
    this.addEvent('good', '+2s', 'System calculates optimal distribution based on history', 1100);
    this.addEvent('good', '+5s', 'PM clicks "Balance Workload" to approve suggestions', 1400);
    this.addEvent('good', '+10s', 'Tasks auto-reassigned; team capacities balanced (all <80%)', 1700);
    this.addEvent('good', '+1 day', 'All engineers on track; sprint delivered on time', 2000);
  }

  addEvent(type: 'bad' | 'good', time: string, text: string, delay: number): void {
    setTimeout(() => {
      const ev = { time, text };
      if (type === 'bad') {
        this.badEvents.push(ev);
      } else {
        this.goodEvents.push(ev);
      }
    }, delay);
  }

  getTasksByStatus(status: 'todo' | 'doing' | 'blocked' | 'done'): PMCard[] {
    return this.pmCards.filter(c => c.status === status);
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }
}
