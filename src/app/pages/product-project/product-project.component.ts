import { Component, HostListener } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  initials: string;
  status: 'todo' | 'doing' | 'blocked' | 'done';
  due: string;
  dueSort: number;
  start: number; // Day of June (5 - 33)
  end: number;   // Day of June
  dep: string | null;
}

@Component({
  selector: 'app-product-project',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './product-project.component.html',
  styleUrl: './product-project.component.css'
})
export class ProductProjectComponent {
  tasks: TaskItem[] = [
    { id: 't1', title: 'Auth flow refactor', assignee: 'Trần Ngọc', initials: 'TN', status: 'todo', due: 'Jun 12', dueSort: 12, start: 5, end: 12, dep: null },
    { id: 't2', title: 'Settings screen redesign', assignee: 'Bảo Linh', initials: 'BL', status: 'todo', due: 'Jun 14', dueSort: 14, start: 10, end: 24, dep: null },
    { id: 't3', title: 'Onboarding flow QA', assignee: 'Minh Hoàng', initials: 'MH', status: 'todo', due: 'Jun 15', dueSort: 15, start: 19, end: 26, dep: 't1' },
    { id: 't4', title: 'Push notifications', assignee: 'Trần Ngọc', initials: 'TN', status: 'blocked', due: 'Jun 10', dueSort: 10, start: 13, end: 21, dep: 'api' },
    { id: 't5', title: 'Analytics dashboard', assignee: 'Bảo Linh', initials: 'BL', status: 'doing', due: 'Jun 11', dueSort: 11, start: 16, end: 27, dep: null },
    { id: 't6', title: 'Splash screen', assignee: 'Minh Hoàng', initials: 'MH', status: 'done', due: '—', dueSort: 0, start: 5, end: 8, dep: null },
    { id: 't7', title: 'Login UI', assignee: 'Trần Ngọc', initials: 'TN', status: 'done', due: '—', dueSort: 0, start: 6, end: 9, dep: null },
  ];

  activeView: 'kanban' | 'list' | 'gantt' = 'kanban';
  statusOrder: ('todo' | 'doing' | 'blocked' | 'done')[] = ['todo', 'doing', 'blocked', 'done'];
  statusLabel = { todo: 'To do', doing: 'Doing', blocked: 'Blocked', done: 'Done' };
  statusPillClass = { todo: 'neutral', doing: 'warn', blocked: 'bad', done: 'good' };

  // Role section
  activeRole: 'ceo' | 'lead' | 'hr' = 'ceo';
  roleContent = {
    ceo: [
      'Visualise organizational bottlenecks across all active engineering teams',
      'Real-time sprint velocity charts generated without manual status updates',
      'Instant warning flags on critical milestone dependency paths',
    ],
    lead: [
      'Identify who has bandwidth and who is overloaded in 3 seconds',
      'Track tasks in Kanban or timeline Gantt automatically synced',
      'Eliminate manual status updates — see status changes from code commits',
    ],
    hr: [
      'Empirical project output maps integrated directly into reviews',
      'Monitor and prevent burnout by tracking individual SP workloads',
      'Cross-check project delivery timelines against holiday schedules',
    ],
  };

  // Sorting
  listSortKey = 'due';
  listSortDir = 1;

  // Gantt configurations
  GANTT_START = 5;
  GANTT_DAYS = 28;

  // Drag state for Gantt
  activeGanttDrag: {
    taskId: string;
    dragMode: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    startLeft: number;
    startWidth: number;
    trackWidth: number;
  } | null = null;

  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openDemo(): void {
    this.modalService.openModal('demo');
  }

  switchView(view: 'kanban' | 'list' | 'gantt'): void {
    this.activeView = view;
  }

  // Kanban Drag and Drop
  onDragStart(event: DragEvent, taskId: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', taskId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, column: 'todo' | 'doing' | 'blocked' | 'done'): void {
    event.preventDefault();
    if (event.dataTransfer) {
      const taskId = event.dataTransfer.getData('text/plain');
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = column;
      }
    }
  }

  getTasksByStatus(status: 'todo' | 'doing' | 'blocked' | 'done'): TaskItem[] {
    return this.tasks.filter(t => t.status === status);
  }

  // List view sort & status cycle
  sortList(key: string): void {
    if (this.listSortKey === key) {
      this.listSortDir *= -1;
    } else {
      this.listSortKey = key;
      this.listSortDir = 1;
    }
  }

  cycleStatus(task: TaskItem): void {
    const idx = this.statusOrder.indexOf(task.status);
    task.status = this.statusOrder[(idx + 1) % this.statusOrder.length];
  }

  getSortedTasks(): TaskItem[] {
    return [...this.tasks].sort((a, b) => {
      let av = a[this.listSortKey as keyof TaskItem];
      let bv = b[this.listSortKey as keyof TaskItem];

      if (this.listSortKey === 'due') {
        av = a.dueSort;
        bv = b.dueSort;
      }

      if (typeof av === 'string' && typeof bv === 'string') {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }

      if (av! < bv!) return -1 * this.listSortDir;
      if (av! > bv!) return 1 * this.listSortDir;
      return 0;
    });
  }

  // Gantt helpers
  dayToPct(day: number): number {
    return ((day - this.GANTT_START) / this.GANTT_DAYS) * 100;
  }

  pctToDay(pct: number): number {
    return Math.round(this.GANTT_START + (pct / 100) * this.GANTT_DAYS);
  }

  dayLabel(day: number): string {
    if (day <= 30) return 'Jun ' + day;
    return 'Jul ' + (day - 30);
  }

  getVisibleGanttTasks(): TaskItem[] {
    return this.tasks.filter(t => t.status !== 'done');
  }

  // Gantt bar resizing & dragging
  startGanttDrag(event: MouseEvent, taskId: string, mode: 'move' | 'resize-start' | 'resize-end'): void {
    event.preventDefault();
    event.stopPropagation();

    const barElement = (event.target as HTMLElement).closest('.gantt-bar') as HTMLElement;
    if (!barElement) return;

    const trackElement = barElement.parentElement as HTMLElement;
    if (!trackElement) return;

    this.activeGanttDrag = {
      taskId: taskId,
      dragMode: mode,
      startX: event.clientX,
      startLeft: parseFloat(barElement.style.left) || 0,
      startWidth: parseFloat(barElement.style.width) || 0,
      trackWidth: trackElement.offsetWidth
    };
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.activeGanttDrag) return;

    const dx = event.clientX - this.activeGanttDrag.startX;
    const dxPct = (dx / this.activeGanttDrag.trackWidth) * 100;
    const task = this.tasks.find(t => t.id === this.activeGanttDrag!.taskId);

    if (!task) return;

    if (this.activeGanttDrag.dragMode === 'move') {
      const dur = task.end - task.start;
      let newLeft = this.activeGanttDrag.startLeft + dxPct;
      const maxLeft = 100 - ((dur / this.GANTT_DAYS) * 100);
      newLeft = Math.max(0, Math.min(maxLeft, newLeft));

      const newStart = this.pctToDay(newLeft);
      task.start = newStart;
      task.end = newStart + dur;
    } else if (this.activeGanttDrag.dragMode === 'resize-start') {
      let newLeft = this.activeGanttDrag.startLeft + dxPct;
      const currentEndPct = this.activeGanttDrag.startLeft + this.activeGanttDrag.startWidth;
      const minLeftLimit = currentEndPct - (1 / this.GANTT_DAYS) * 100;
      newLeft = Math.max(0, Math.min(minLeftLimit, newLeft));

      task.start = this.pctToDay(newLeft);
    } else if (this.activeGanttDrag.dragMode === 'resize-end') {
      let newWidth = this.activeGanttDrag.startWidth + dxPct;
      const maxWidth = 100 - this.activeGanttDrag.startLeft;
      newWidth = Math.max((1 / this.GANTT_DAYS) * 100, Math.min(maxWidth, newWidth));

      task.end = this.pctToDay(this.activeGanttDrag.startLeft + newWidth);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.activeGanttDrag) {
      this.activeGanttDrag = null;
    }
  }
}
