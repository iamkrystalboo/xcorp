import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface OkrItem {
  id: string;
  level: 'company' | 'group' | 'team' | 'individual';
  title: string;
  progress: number; // For leaf nodes, this is editable/checked-in. For parent nodes, it rolls up.
  parent: string | null;
  metric: string;
  timeline: string;
  startValue: number;
  expectedValue: number;
  currentValue: number;
}

@Component({
  selector: 'app-okr',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './okr.component.html',
  styleUrl: './okr.component.css'
})
export class OkrComponent implements OnInit {
  okrData: OkrItem[] = [
    { id: 'c1', level: 'company', title: 'Grow ARR to $2M', progress: 82, parent: null, metric: 'ARR', timeline: 'Q2 2026', startValue: 0, expectedValue: 2000000, currentValue: 1640000 },
    { id: 'g1', level: 'group', title: 'Expand Enterprise Segment', progress: 75, parent: 'c1', metric: 'deals count', timeline: 'Q2 2026', startValue: 0, expectedValue: 50, currentValue: 38 },
    { id: 't1', level: 'team', title: 'Close 40 enterprise deals', progress: 75, parent: 'g1', metric: 'deals', timeline: 'Q2 2026', startValue: 0, expectedValue: 40, currentValue: 30 },
    { id: 'i1', level: 'individual', title: 'Secure 5 key pilots', progress: 60, parent: 't1', metric: 'pilots', timeline: 'Q2 2026', startValue: 0, expectedValue: 5, currentValue: 3 },
  ];

  // Role description tabs
  activeRole: 'ceo' | 'lead' | 'hr' = 'ceo';
  roleContent = {
    ceo: [
      'Real-time visibility into which goals are on track and which need intervention',
      'Direct line from quarterly strategy to weekly individual work',
      'No more "we missed it but it\'s too late to fix" quarterly reviews',
    ],
    lead: [
      'Set team OKRs that visibly ladder up to company priorities',
      'Track team check-ins without becoming the nagging manager',
      'See which individuals need support before they fall behind',
    ],
    hr: [
      'Performance reviews driven by data, not memory',
      'Compensation decisions grounded in measurable OKR outcomes',
      'Promotion criteria mapped to historical goal achievement',
    ],
  };

  // Form State
  selectedLevel: 'company' | 'group' | 'team' | 'individual' = 'company';
  okrTitle = '';
  okrParent = '';
  okrMetric = '';
  okrTimeline = '';
  okrStartValue = 0;
  okrExpectedValue = 100;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openDemo(): void {
    this.modalService.openModal('demo');
  }

  changeLevel(level: 'company' | 'group' | 'team' | 'individual'): void {
    this.selectedLevel = level;
    // Set default parent
    const parents = this.getPotentialParents();
    this.okrParent = parents.length > 0 ? parents[0].id : '';
  }

  getPotentialParents(): OkrItem[] {
    let parentLevel: 'company' | 'group' | 'team';
    if (this.selectedLevel === 'company') return [];
    if (this.selectedLevel === 'group') parentLevel = 'company';
    else if (this.selectedLevel === 'team') parentLevel = 'group';
    else parentLevel = 'team';

    return this.okrData.filter(o => o.level === parentLevel);
  }

  calculateProgress(okrId: string): number {
    const children = this.okrData.filter(o => o.parent === okrId);
    if (children.length === 0) {
      const okr = this.okrData.find(o => o.id === okrId);
      return okr ? okr.progress : 0;
    }
    const sum = children.reduce((acc, c) => acc + this.calculateProgress(c.id), 0);
    return Math.round(sum / children.length);
  }

  getNodeColor(pct: number): 'good' | 'warn' | 'bad' {
    if (pct >= 75) return 'good';
    if (pct >= 40) return 'warn';
    return 'bad';
  }

  hasChildren(okrId: string): boolean {
    return this.okrData.some(o => o.parent === okrId);
  }

  getChildrenCount(okrId: string): number {
    return this.okrData.filter(o => o.parent === okrId).length;
  }

  getLeafValue(node: OkrItem): number {
    if (node.currentValue !== undefined) return node.currentValue;
    const range = node.expectedValue - node.startValue;
    return Math.round((node.progress * range) / 100 + node.startValue);
  }

  handleCheckin(node: OkrItem, inputVal: string): void {
    const val = parseFloat(inputVal) || 0;
    node.currentValue = val;
    const range = node.expectedValue - node.startValue;
    if (range !== 0) {
      node.progress = Math.max(0, Math.min(100, Math.round(((val - node.startValue) / range) * 100)));
    } else {
      node.progress = 100;
    }
  }

  handleDelete(id: string): void {
    // Check cascade children
    const getCascadeCount = (parentId: string): number => {
      const ch = this.okrData.filter(o => o.parent === parentId);
      return ch.length + ch.reduce((s, c) => s + getCascadeCount(c.id), 0);
    };

    const cascadeCount = getCascadeCount(id);
    if (cascadeCount > 0) {
      if (!confirm(`Removing this will also remove ${cascadeCount} child OKR(s). Continue?`)) {
        return;
      }
    }

    const toRemove = new Set<string>([id]);
    const markChildren = (pid: string) => {
      this.okrData.filter(o => o.parent === pid).forEach(c => {
        toRemove.add(c.id);
        markChildren(c.id);
      });
    };
    markChildren(id);

    this.okrData = this.okrData.filter(o => !toRemove.has(o.id));
  }

  handleAddOkr(): void {
    if (!this.okrTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    if (this.selectedLevel !== 'company' && !this.okrParent) {
      const parentName = this.selectedLevel === 'team' ? 'Group' : this.selectedLevel === 'group' ? 'Company' : 'Team';
      alert(`Please select a parent ${parentName} OKR first.`);
      return;
    }

    const newOkr: OkrItem = {
      id: 'o' + Date.now(),
      level: this.selectedLevel,
      title: this.okrTitle.trim(),
      metric: this.okrMetric.trim(),
      timeline: this.okrTimeline.trim() || 'Q2 2026',
      startValue: this.okrStartValue,
      expectedValue: this.okrExpectedValue,
      currentValue: this.okrStartValue,
      progress: 0,
      parent: this.selectedLevel === 'company' ? null : this.okrParent
    };

    this.okrData.push(newOkr);
    this.resetForm();
  }

  resetForm(): void {
    this.okrTitle = '';
    this.okrMetric = '';
    this.okrTimeline = '';
    this.okrStartValue = 0;
    this.okrExpectedValue = 100;
    this.selectedLevel = 'company';
    this.okrParent = '';
  }

  getCompanyAvg(): number {
    const companies = this.okrData.filter(o => o.level === 'company');
    if (companies.length === 0) return 0;
    const sum = companies.reduce((acc, c) => acc + this.calculateProgress(c.id), 0);
    return Math.round(sum / companies.length);
  }

  // Hierarchical view ordering
  getOrderedOkrData(): OkrItem[] {
    const ordered: OkrItem[] = [];
    const companies = this.okrData.filter(o => o.level === 'company');

    companies.forEach(c => {
      ordered.push(c);
      const groups = this.okrData.filter(o => o.parent === c.id && o.level === 'group');
      groups.forEach(g => {
        ordered.push(g);
        const teams = this.okrData.filter(o => o.parent === g.id && o.level === 'team');
        teams.forEach(t => {
          ordered.push(t);
          const individuals = this.okrData.filter(o => o.parent === t.id && o.level === 'individual');
          individuals.forEach(i => {
            ordered.push(i);
          });
        });
      });
    });

    return ordered;
  }
}
