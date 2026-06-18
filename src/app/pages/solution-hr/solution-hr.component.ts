import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface WeekBlock {
  type: 'admin' | 'approval' | 'timesheet' | 'strategic' | 'recovered';
  start: number;
  width: number;
}

@Component({
  selector: 'app-solution-hr',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './solution-hr.component.html',
  styleUrl: './solution-hr.component.css'
})
export class SolutionHrComponent implements OnInit {
  hrMode: 'before' | 'after' = 'before';
  teamSize = 100;
  hoursSaved = 22;
  yearlySavings = 28;

  beforePatterns: WeekBlock[][] = [
    // HR Lead: heavy approval + timesheet
    [
      { type: 'admin', start: 0, width: 25 },
      { type: 'approval', start: 25, width: 30 },
      { type: 'timesheet', start: 55, width: 25 },
      { type: 'strategic', start: 80, width: 20 },
    ],
    // HR Coordinator: very heavy admin
    [
      { type: 'admin', start: 0, width: 35 },
      { type: 'approval', start: 35, width: 25 },
      { type: 'timesheet', start: 60, width: 30 },
      { type: 'strategic', start: 90, width: 10 },
    ],
    // Ops Manager: mix
    [
      { type: 'admin', start: 0, width: 20 },
      { type: 'approval', start: 20, width: 20 },
      { type: 'timesheet', start: 40, width: 20 },
      { type: 'strategic', start: 60, width: 40 },
    ],
  ];

  afterPatterns: WeekBlock[][] = [
    // HR Lead: mostly strategic
    [
      { type: 'admin', start: 0, width: 6 },
      { type: 'approval', start: 6, width: 4 },
      { type: 'timesheet', start: 10, width: 5 },
      { type: 'recovered', start: 15, width: 35 },
      { type: 'strategic', start: 50, width: 50 },
    ],
    // HR Coordinator: massive recovery
    [
      { type: 'admin', start: 0, width: 8 },
      { type: 'approval', start: 8, width: 5 },
      { type: 'timesheet', start: 13, width: 7 },
      { type: 'recovered', start: 20, width: 45 },
      { type: 'strategic', start: 65, width: 35 },
    ],
    // Ops Manager: scaling matters
    [
      { type: 'admin', start: 0, width: 5 },
      { type: 'approval', start: 5, width: 3 },
      { type: 'timesheet', start: 8, width: 4 },
      { type: 'recovered', start: 12, width: 28 },
      { type: 'strategic', start: 40, width: 60 },
    ],
  ];

  labels = {
    admin: 'Admin',
    approval: 'Approvals',
    timesheet: 'Timesheets',
    strategic: 'Strategic',
    recovered: '+ Recovered',
  };

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.updateHrSim();
  }

  setMode(mode: 'before' | 'after'): void {
    this.hrMode = mode;
    this.updateHrSim();
  }

  onSliderInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.teamSize = parseInt(target.value, 10);
    this.updateHrSim();
  }

  updateHrSim(): void {
    // Hours saved formula: scales with team size
    // Base: 22h/week saved per HR person at 100 employees
    const baseHours = (this.teamSize / 100) * 22;
    this.hoursSaved = Math.round(baseHours);

    // Annual savings: assuming ~$25/hr loaded labor cost
    this.yearlySavings = Math.round(this.hoursSaved * 50 * 25 / 1000);
  }

  getTrackBlocks(trackIndex: number): WeekBlock[] {
    const patterns = this.hrMode === 'before' ? this.beforePatterns : this.afterPatterns;
    return patterns[trackIndex];
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }

  exportCSV(): void {
    alert('Demo: timesheet CSV exported!');
  }
}
