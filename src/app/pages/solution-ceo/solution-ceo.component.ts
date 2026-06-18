import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface DashboardTile {
  stat: string;
  sub: string;
  insight: string;
  insightClass: string;
}

@Component({
  selector: 'app-solution-ceo',
  standalone: true,
  imports: [NgIf, NgClass, RouterLink],
  templateUrl: './solution-ceo.component.html',
  styleUrl: './solution-ceo.component.css'
})
export class SolutionCeoComponent {
  ceoScenarioActive = false;
  expandedTile: string | null = null;

  normalData: Record<string, DashboardTile> = {
    okr: { 
      stat: '74%', 
      sub: 'Average progress · 3 at risk', 
      insight: '⚠ Sales OKR is 18% behind. Q3 target depends on closing 8 more deals this month.', 
      insightClass: 'warn' 
    },
    projects: { 
      stat: '2', 
      sub: 'Mobile v2 · API migration', 
      insight: '⚠ Mobile v2 is blocked by API migration (stalled 4 days).', 
      insightClass: 'bad' 
    },
    capacity: { 
      stat: '87%', 
      sub: 'Stretched capacity', 
      insight: '⚠ Engineering OKRs: 92% alignment · Sales: 78% · Marketing: 65% · Operations: 85%', 
      insightClass: 'warn' 
    },
    hr: { 
      stat: '47', 
      sub: 'Total check-ins · 12 pending', 
      insight: '98% on-time check-in rate · 2 final reviews done · Sales team needs to check in by Friday.', 
      insightClass: 'good' 
    }
  };

  mondayData: Record<string, DashboardTile> = {
    okr: { 
      stat: '68%', 
      sub: 'Average progress · 5 at risk (weekend updates)', 
      insight: '🚨 ARR target slipped over weekend. Need decision on Q3 pivot by EOD.', 
      insightClass: 'bad' 
    },
    projects: { 
      stat: '5', 
      sub: 'Of 15 active goals · 3 slipped this weekend', 
      insight: '🚨 3 main company Key Results slipped. Marketing and Product OKRs need triage.', 
      insightClass: 'bad' 
    },
    capacity: { 
      stat: '72%', 
      sub: 'Across all teams · misalignment zone', 
      insight: '🚨 Engineering alignment slipped to 80% due to project reallocations. Triage needed.', 
      insightClass: 'bad' 
    },
    hr: { 
      stat: '28', 
      sub: 'Total check-ins · 19 pending this morning', 
      insight: '🚨 Check-in completion rate dropped to 65%. 19 managers need to check in.', 
      insightClass: 'bad' 
    }
  };

  constructor(private modalService: ModalService) {}

  toggleScenario(): void {
    this.ceoScenarioActive = !this.ceoScenarioActive;
  }

  toggleTile(tileName: string): void {
    if (this.expandedTile === tileName) {
      this.expandedTile = null;
    } else {
      this.expandedTile = tileName;
    }
  }

  getData(tileName: string): DashboardTile {
    return this.ceoScenarioActive ? this.mondayData[tileName] : this.normalData[tileName];
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }
}
