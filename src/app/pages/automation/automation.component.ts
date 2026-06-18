import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface WorkflowNode {
  type: string;
  label: string;
}

interface RunHistoryItem {
  id: number;
  timestamp: string;
  nodes: WorkflowNode[];
  logLines: string[];
}

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './automation.component.html',
  styleUrl: './automation.component.css'
})
export class AutomationComponent {
  workflow: WorkflowNode[] = [];
  autoRuns: RunHistoryItem[] = [];
  runLog: string[] = [];
  
  // Drag states
  isDragOver = false;
  isRunning = false;
  runStatus = 'Build your workflow above';

  activeRole: 'ceo' | 'lead' | 'hr' = 'ceo';
  roleContent = {
    ceo: [
      { title: 'Standardized', desc: 'Processes are standardized — no longer dependent on one person knowing the steps', icon: 'sparkle', color: 'purple' },
      { title: 'Automation', desc: 'Automated weekly reports land in your inbox without anyone compiling them', icon: 'network', color: 'green' },
      { title: 'Visibility', desc: 'Visibility into which workflows are running and where things get stuck', icon: 'search', color: 'orange' }
    ],
    lead: [
      { title: 'Milestone Alerts', desc: 'Milestone alerts fire automatically — no manual nudging the team', icon: 'sparkle', color: 'purple' },
      { title: 'Custom Workflows', desc: 'Custom sprint workflows built without touching code', icon: 'network', color: 'green' },
      { title: 'Slack Sync', desc: 'Slack notifications go to the right person at the right stage', icon: 'search', color: 'orange' }
    ],
    hr: [
      { title: 'Leave Approvals', desc: 'Leave approvals run automatically — no more inbox approval chains', icon: 'sparkle', color: 'purple' },
      { title: 'Onboarding', desc: 'Onboarding checklists trigger on day one without manual setup', icon: 'network', color: 'green' },
      { title: 'Policy Rules', desc: 'Policy-based rules mean nothing slips through the cracks', icon: 'search', color: 'orange' }
    ]
  };

  // Palette blocks
  triggers = [
    { type: 'trigger', label: 'New leave request' },
    { type: 'trigger', label: 'Deal closed' },
    { type: 'trigger', label: 'Google Forms webhook' }
  ];

  conditions = [
    { type: 'condition', label: 'If days ≤ 2' },
    { type: 'condition', label: 'If amount > $50k' }
  ];

  aiAgents = [
    { type: 'action', label: 'AI Agent check-in' },
    { type: 'action', label: 'AI Summary' },
    { type: 'action', label: 'Translate text' }
  ];

  apps = [
    { type: 'action', label: 'Sync to Google Sheets' },
    { type: 'action', label: 'Post to Slack' },
    { type: 'action', label: 'Notion database sync' },
    { type: 'action', label: 'Send via Gmail' },
    { type: 'action', label: 'Create Google Doc' },
    { type: 'action', label: 'Cloudinary upload' }
  ];

  utilities = [
    { type: 'condition', label: 'Router branch' },
    { type: 'action', label: 'Run custom JavaScript' },
    { type: 'action', label: 'Send HTTP Request' },
    { type: 'condition', label: 'Table lookup' }
  ];

  actions = [
    { type: 'action', label: 'Notify in Slack' },
    { type: 'action', label: 'Send email' },
    { type: 'action', label: 'Auto-approve' }
  ];

  constructor(private modalService: ModalService) {}

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openDemo(): void {
    this.modalService.openModal('demo');
  }

  // Drag and drop logic
  onDragStart(event: DragEvent, type: string, label: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('type', type);
      event.dataTransfer.setData('label', label);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer) {
      const type = event.dataTransfer.getData('type');
      const label = event.dataTransfer.getData('label');

      if (type && label) {
        this.workflow.push({ type, label });
        this.updateStatus();
      }
    }
  }

  removeNode(index: number): void {
    this.workflow.splice(index, 1);
    this.updateStatus();
  }

  isRunnable(): boolean {
    const hasTrigger = this.workflow.some(n => n.type === 'trigger');
    const hasAction = this.workflow.some(n => n.type === 'action');
    return hasTrigger && hasAction && !this.isRunning;
  }

  updateStatus(): void {
    if (this.workflow.length === 0) {
      this.runStatus = 'Build your workflow above';
      return;
    }

    const hasTrigger = this.workflow.some(n => n.type === 'trigger');
    const hasAction = this.workflow.some(n => n.type === 'action');

    if (hasTrigger && hasAction) {
      this.runStatus = 'Ready to run';
    } else {
      this.runStatus = 'Need at least 1 trigger + 1 action';
    }
  }

  getNodeIcon(node: WorkflowNode): string {
    if (node.type === 'trigger') return '⚡';
    if (node.type === 'condition') return '◇';
    
    // Action Node Icons
    const label = node.label;
    if (label.includes('AI') || label.includes('Agent') || label.includes('Translate')) return '🤖';
    if (label.includes('Google Sheets') || label.includes('Slack') || label.includes('Notion') || label.includes('Gmail') || label.includes('Doc') || label.includes('Cloudinary') || label.includes('Form')) return '🔌';
    if (label.includes('JavaScript') || label.includes('HTTP') || label.includes('Code')) return '⚙️';
    
    return '▶';
  }

  runWorkflow(): void {
    if (!this.isRunnable()) return;

    this.runLog = [];
    this.isRunning = true;
    this.runStatus = 'Running…';

    let currentDelay = 0;
    this.workflow.forEach((node, idx) => {
      setTimeout(() => {
        const stamp = new Date().toLocaleTimeString();
        this.runLog.push(`[${stamp}] ${node.type.toUpperCase()} — ${node.label} ✓`);
      }, currentDelay);
      currentDelay += 700;
    });

    setTimeout(() => {
      const finalDelaySecs = (currentDelay / 1000).toFixed(1);
      this.runLog.push(`[done] Workflow completed in ${finalDelaySecs}s — 0 errors`);
      this.runStatus = 'Workflow ran successfully';
      this.isRunning = false;

      // Add to Run History
      this.autoRuns.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        nodes: [...this.workflow],
        logLines: [...this.runLog]
      });
    }, currentDelay + 200);
  }

  viewPastRun(run: RunHistoryItem): void {
    this.runLog = [...run.logLines];
    this.runStatus = `Viewing run from ${run.timestamp}`;
  }

  clearHistory(): void {
    this.autoRuns = [];
  }
}
