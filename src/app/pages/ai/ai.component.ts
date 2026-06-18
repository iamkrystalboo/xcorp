import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  isTable?: boolean;
}

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css'
})
export class AiComponent {
  userInput = '';
  isTyping = false;

  messages: ChatMessage[] = [
    {
      content: "👋 Hi! I'm your XCorp AI Assistant. Ask me about leave, OKRs, tasks, or team workload — I'll pull live data for you instantly.",
      isUser: false
    }
  ];

  suggestedPrompts = [
    { label: '🗓️ Who\'s on leave this week?', query: 'Who\'s on leave this week?' },
    { label: '🎯 Show my OKR progress', query: 'Show my OKR progress' },
    { label: '⚠️ What tasks are overdue?', query: 'What tasks are overdue?' },
    { label: '📋 Summarize Sprint 24', query: 'Summarize Sprint 24' },
    { label: '📊 Check team workload', query: 'Check team workload' }
  ];

  aiResponses: Record<string, string> = {
    leave: `Found <b>3 team members</b> on leave this week:
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; color: var(--text-primary);">
        <tr style="border-bottom: 1px solid var(--border); text-align: left;"><th style="padding: 6px 0;">Name</th><th style="padding: 6px 0;">Dates</th><th style="padding: 6px 0;">Type</th></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🟢 Linh Trần</td><td style="padding: 6px 0;">Mon–Wed</td><td style="padding: 6px 0;">Annual</td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🟡 Minh Hoàng</td><td style="padding: 6px 0;">Thu–Fri</td><td style="padding: 6px 0;">Personal</td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🔵 Bảo Ngọc</td><td style="padding: 6px 0;">Full week</td><td style="padding: 6px 0;">Annual</td></tr>
      </table>
      <div style="margin-top:8px; font-size:11px; color:var(--warning); font-weight:600;">⚠ Coverage gap on Thursday — only 2 of 6 engineers available.</div>`,
    okr: `Here's your OKR progress for <b>Q2 2026</b>:
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; color: var(--text-primary);">
        <tr style="border-bottom: 1px solid var(--border); text-align: left;"><th style="padding: 6px 0;">Objective</th><th style="padding: 6px 0;">Progress</th><th style="padding: 6px 0;">Status</th></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Grow ARR to $2M</td><td style="padding: 6px 0; color:var(--success); font-weight:bold;">82%</td><td style="padding: 6px 0;"><span class="pill good" style="font-size:10px;">on track</span></td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Launch mobile app v2</td><td style="padding: 6px 0; color:var(--warning); font-weight:bold;">55%</td><td style="padding: 6px 0;"><span class="pill warn" style="font-size:10px;">at risk</span></td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">4 client reviews</td><td style="padding: 6px 0; color:var(--danger); font-weight:bold;">25%</td><td style="padding: 6px 0;"><span class="pill bad" style="font-size:10px;">behind</span></td></tr>
      </table>
      <div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">💡 Tip: Focus on "4 client reviews" — it's the most behind schedule.</div>`,
    overdue: `Found <b>3 overdue tasks</b> in active sprints:
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; color: var(--text-primary);">
        <tr style="border-bottom: 1px solid var(--border); text-align: left;"><th style="padding: 6px 0;">Task</th><th style="padding: 6px 0;">Owner</th><th style="padding: 6px 0;">Overdue</th></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🔴 Payment Gateway API</td><td style="padding: 6px 0;">Minh</td><td style="padding: 6px 0;">5 days</td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🔴 Auth v2 migration</td><td style="padding: 6px 0;">Linh</td><td style="padding: 6px 0;">2 days</td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">🟡 Dashboard redesign</td><td style="padding: 6px 0;">Bảo</td><td style="padding: 6px 0;">1 day</td></tr>
      </table>
      <div style="margin-top:8px; font-size:11px; color:var(--danger); font-weight:600;">🚨 Payment Gateway API has been blocked for 5 days — consider reassigning or removing blockers.</div>`,
    sprint: `<b>Sprint 24 — Mobile v2</b> summary:
      <div style="margin:8px 0; display:grid; grid-template-columns:repeat(3,1fr); gap:6px;">
        <div style="background:var(--bg-secondary); border-radius:6px; padding:8px; text-align:center;"><b style="font-size:16px;">8</b><div style="font-size:10px; color:var(--text-secondary);">Completed</div></div>
        <div style="background:var(--bg-secondary); border-radius:6px; padding:8px; text-align:center;"><b style="font-size:16px;">4</b><div style="font-size:10px; color:var(--text-secondary);">In Progress</div></div>
        <div style="background:var(--danger-light); border-radius:6px; padding:8px; text-align:center;"><b style="font-size:16px; color:var(--danger);">3</b><div style="font-size:10px; color:var(--text-secondary);">Overdue</div></div>
      </div>
      <div style="font-size:11px; color:var(--text-secondary);">Velocity: <b>34 SP</b> (↑12% vs Sprint 23) · Sprint ends Friday</div>`,
    workload: `Team workload for this week:
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; color: var(--text-primary);">
        <tr style="border-bottom: 1px solid var(--border); text-align: left;"><th style="padding: 6px 0;">Member</th><th style="padding: 6px 0;">Tasks</th><th style="padding: 6px 0;">SP</th><th style="padding: 6px 0;">Load</th></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Minh Hoàng</td><td style="padding: 6px 0;">6</td><td style="padding: 6px 0;">18 SP</td><td style="padding: 6px 0;"><span class="pill bad" style="font-size:10px;">overloaded</span></td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Linh Trần</td><td style="padding: 6px 0;">4</td><td style="padding: 6px 0;">12 SP</td><td style="padding: 6px 0;"><span class="pill good" style="font-size:10px;">balanced</span></td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Bảo Ngọc</td><td style="padding: 6px 0;">2</td><td style="padding: 6px 0;">6 SP</td><td style="padding: 6px 0;"><span class="pill good" style="font-size:10px;">light</span></td></tr>
        <tr style="border-bottom: 1px solid var(--border);"><td style="padding: 6px 0;">Phạm Hoa</td><td style="padding: 6px 0;">5</td><td style="padding: 6px 0;">15 SP</td><td style="padding: 6px 0;"><span class="pill warn" style="font-size:10px;">heavy</span></td></tr>
      </table>
      <div style="margin-top:8px; font-size:11px; color:var(--warning); font-weight:600;">⚠ Minh is overloaded at 18 SP. Consider moving 1-2 tasks to Bảo Ngọc (6 SP).</div>`
  };

  // Role Switcher
  activeRole: 'ceo' | 'lead' | 'hr' = 'ceo';
  roleContent = {
    ceo: [
      '<strong>"Show me company OKR progress"</strong> — Get an instant executive summary of all company-level objectives with health indicators.',
      '<strong>"What needs my attention today?"</strong> — Surface escalations, stale goals, and blocked initiatives requiring leadership action.',
      '<strong>"Compare Q1 vs Q2 performance"</strong> — Trend analysis across teams, velocity, and goal completion rates with zero manual calculations.'
    ],
    lead: [
      '<strong>"Who on my team is overloaded?"</strong> — Real-time workload analysis with rebalancing suggestions based on capacity and deadlines.',
      '<strong>"Summarize this sprint"</strong> — Completed tasks, velocity, blockers, and carry-over items compiled into one clean summary.',
      '<strong>"How are my team\'s OKRs tracking?"</strong> — Drill into team-level goals with linked tasks, check-in status, and predicted outcomes.'
    ],
    hr: [
      '<strong>"Who\'s on leave next week?"</strong> — Complete leave calendar with coverage analysis and automatic conflict detection.',
      '<strong>"Generate attendance report for June"</strong> — Compiles check-in data, overtime hours, and absence patterns into a ready-to-export report.',
      '<strong>"Any pending leave approvals?"</strong> — Lists all pending requests with policy check results and recommended actions.'
    ]
  };

  constructor(private modalService: ModalService) {}

  matchAiResponse(text: string): string {
    const q = text.toLowerCase();
    if (q.includes('leave') || q.includes('off') || q.includes('vacation') || q.includes('nghỉ')) return this.aiResponses['leave'];
    if (q.includes('okr') || q.includes('goal') || q.includes('progress') || q.includes('objective')) return this.aiResponses['okr'];
    if (q.includes('overdue') || q.includes('late') || q.includes('blocked') || q.includes('blocking')) return this.aiResponses['overdue'];
    if (q.includes('sprint') || q.includes('summarize') || q.includes('summary')) return this.aiResponses['sprint'];
    if (q.includes('workload') || q.includes('capacity') || q.includes('team load') || q.includes('busy')) return this.aiResponses['workload'];
    return `I searched across your XCorp workspace for "<b>${text}</b>" but couldn't find a specific match. Try asking about:<br>• Leave & attendance<br>• OKR progress<br>• Overdue tasks<br>• Sprint summary<br>• Team workload`;
  }

  sendPrompt(promptText: string): void {
    if (!promptText.trim()) return;

    // Add user message
    this.messages.push({ content: promptText, isUser: true });

    // Show typing indicator
    this.isTyping = true;

    // Simulate bot response delay
    setTimeout(() => {
      this.isTyping = false;
      const reply = this.matchAiResponse(promptText);
      this.messages.push({ content: reply, isUser: false });

      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById('aiChatMessages');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    }, 800 + Math.random() * 400);
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      this.sendPrompt(this.userInput);
      this.userInput = '';
    }
  }

  setRole(role: 'ceo' | 'lead' | 'hr'): void {
    this.activeRole = role;
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }
}
