import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface SearchDocItem {
  title: string;
  app: string;
  type: string;
  time: string;
  text: string;
  keyword: string;
}

interface SearchTaskItem {
  title: string;
  app: string;
  type: string;
  time: string;
  text: string;
  keyword: string;
  epic?: string;
  assignee?: string;
}

interface SuggestChip {
  label: string;
  query: string;
}

@Component({
  selector: 'app-usecase-scattered',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './usecase-scattered.component.html',
  styleUrl: './usecase-scattered.component.css'
})
export class UsecaseScatteredComponent implements OnInit {
  activeTab: 'docs' | 'tasks' = 'docs';
  searchQuery = '';
  showClearBtn = false;

  docDb: SearchDocItem[] = [
    { title: 'Onboarding Checklist Template', app: '📝 Notion', type: 'Document', time: 'Created by HR', text: 'standardized hiring checklists documents', keyword: 'onboarding' },
    { title: 'Series A Pitch Deck v2', app: '📧 Gmail', type: 'Email', time: 'Sent by CEO yesterday', text: 'please review the deck and slide revisions', keyword: 'pitch deck' },
    { title: 'Brand Guidelines 2026', app: '📝 Notion', type: 'Document', time: 'Updated 1w ago', text: 'brand guidelines styles typography logos', keyword: 'brand' },
    { title: 'Q3 Product Strategy', app: '📁 Drive', type: 'Document', time: 'Updated 3d ago', text: 'product roadmap and design mockups strategy', keyword: 'strategy' }
  ];

  taskDb: SearchTaskItem[] = [
    { title: 'Q3 Onboarding Sprint', app: '📋 Jira', type: 'Project Board', time: 'Updated 2h ago', text: 'onboarding plan and checklist tasks', keyword: 'onboarding', epic: 'onboarding', assignee: 'krystal' },
    { title: 'OKR: Employee Onboarding < 14 days', app: '🎯 OKR', type: 'Goals', time: '72% complete', text: 'reduce onboarding duration goals and targets', keyword: 'onboarding', epic: 'onboarding', assignee: 'hr' },
    { title: 'API Integration Blockers', app: '💬 Slack', type: 'Chat', time: 'Posted in #engineering', text: 'vendor outage blocks oauth flow', keyword: 'api', epic: 'api', assignee: 'john' },
    { title: 'Design new landing page', app: '✅ Asana', type: 'Task', time: 'Due in 2 days', text: 'design homepage mockups and assets', keyword: 'design', epic: 'marketing', assignee: 'sarah' },
    { title: 'Implement authentication flow', app: '📋 Jira', type: 'Task', time: 'In Progress', text: 'oauth authentication backend flow', keyword: 'auth', epic: 'api', assignee: 'john' }
  ];

  suggests = {
    docs: [
      { label: 'onboarding', query: 'onboarding' },
      { label: 'pitch deck', query: 'pitch deck' },
      { label: 'brand', query: 'brand' }
    ],
    tasks: [
      { label: 'epic:onboarding', query: 'epic:onboarding' },
      { label: 'assignee:john', query: 'assignee:john' },
      { label: 'api', query: 'api' }
    ]
  };

  filteredDocs: SearchDocItem[] = [];
  filteredTasks: SearchTaskItem[] = [];

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.runSearch();
  }

  setTab(tab: 'docs' | 'tasks'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.runSearch();
  }

  getSuggests(): SuggestChip[] {
    return this.suggests[this.activeTab];
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.runSearch();
  }

  setQuery(query: string): void {
    this.searchQuery = query;
    this.runSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.runSearch();
  }

  runSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.showClearBtn = q.length > 0;

    if (this.activeTab === 'docs') {
      if (!q) {
        this.filteredDocs = [];
        return;
      }
      this.filteredDocs = this.docDb.filter(item => {
        return item.title.toLowerCase().includes(q) ||
               item.type.toLowerCase().includes(q) ||
               item.text.toLowerCase().includes(q) ||
               item.keyword.toLowerCase().includes(q) ||
               item.app.toLowerCase().includes(q);
      });
    } else {
      if (!q) {
        this.filteredTasks = [];
        return;
      }

      let epicFilter: string | null = null;
      let assigneeFilter: string | null = null;

      const epicMatch = q.match(/epic:(\S+)/i);
      if (epicMatch) {
        epicFilter = epicMatch[1];
      }

      const assigneeMatch = q.match(/assignee:(\S+)/i);
      if (assigneeMatch) {
        assigneeFilter = assigneeMatch[1];
      }

      let cleanQ = q
        .replace(/epic:\S+/gi, '')
        .replace(/assignee:\S+/gi, '')
        .trim();

      this.filteredTasks = this.taskDb.filter(item => {
        if (epicFilter && (!item.epic || !item.epic.toLowerCase().includes(epicFilter))) {
          return false;
        }
        if (assigneeFilter && (!item.assignee || !item.assignee.toLowerCase().includes(assigneeFilter))) {
          return false;
        }
        if (cleanQ) {
          return item.title.toLowerCase().includes(cleanQ) ||
                 item.type.toLowerCase().includes(cleanQ) ||
                 item.text.toLowerCase().includes(cleanQ) ||
                 item.keyword.toLowerCase().includes(cleanQ) ||
                 item.app.toLowerCase().includes(cleanQ);
        }
        return true;
      });
    }
  }

  getPlaceholderText(): string {
    return this.activeTab === 'docs' 
      ? 'Search documents (e.g. "onboarding checklist", "pitch deck")...'
      : 'Search tasks (e.g. "epic:onboarding", "assignee:john")...';
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }
}
