import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    data: {
      title: 'xcorp — One system for every team. Less chaos. More clarity.',
      description: 'Replaces app chaos with a single, clear command center. OKRs, project management, workflows, and HR in one system.'
    }
  },
  {
    path: 'products/okr',
    loadComponent: () => import('./pages/okr/okr.component').then(m => m.OkrComponent),
    data: {
      title: 'OKR Management System — xcorp',
      description: 'Stop reporting OKRs in PowerPoint. Set cascades at every level, track progress in real-time, and automate check-ins.'
    }
  },
  {
    path: 'products/project',
    loadComponent: () => import('./pages/product-project/product-project.component').then(m => m.ProductProjectComponent),
    data: {
      title: 'Task & Project Management — xcorp',
      description: 'Kanban boards, Gantt charts, task dependencies, and workload heatmaps. See blockers before they happen and keep teams aligned.'
    }
  },
  {
    path: 'products/automation',
    loadComponent: () => import('./pages/automation/automation.component').then(m => m.AutomationComponent),
    data: {
      title: 'Workflow Automation Engine — xcorp',
      description: 'Build no-code and low-code workflows. Standardize processes, auto-approve simple requests, and eliminate repetitive work.'
    }
  },
  {
    path: 'products/hr',
    loadComponent: () => import('./pages/product-hr/product-hr.component').then(m => m.ProductHrComponent),
    data: {
      title: 'HR & Leave Management — xcorp',
      description: 'Automate leave requests, timesheets, and attendance tracking. Closed-loop approvals and one-click Vietnamese payroll export.'
    }
  },
  {
    path: 'solutions/leadership',
    loadComponent: () => import('./pages/solution-ceo/solution-ceo.component').then(m => m.SolutionCeoComponent),
    data: {
      title: 'Unified CEO Dashboard & Org Health — xcorp',
      description: 'One command center for company strategy, OKR rollup, capacity heatmaps, and HR snapshots. Run your company in real-time.'
    }
  },
  {
    path: 'solutions/teams',
    loadComponent: () => import('./pages/solution-pm/solution-pm.component').then(m => m.SolutionPmComponent),
    data: {
      title: 'Project Delivery & Sprint Reports — xcorp',
      description: 'Connect Slack, Jira, and GitHub. Monitor sprints, catch blocks in 30 seconds, and prevent engineer burnout.'
    }
  },
  {
    path: 'solutions/hr',
    loadComponent: () => import('./pages/solution-hr/solution-hr.component').then(m => m.SolutionHrComponent),
    data: {
      title: 'Automate Admin Work for People Ops — xcorp',
      description: 'Give your HR team their Fridays back. Eliminate spreadsheet-based attendance tracking and manual leave routing.'
    }
  },
  {
    path: 'use-cases/drowning-in-apps',
    loadComponent: () => import('./pages/usecase-scattered/usecase-scattered.component').then(m => m.UsecaseScatteredComponent),
    data: {
      title: 'Replace 7+ Scattered Apps — xcorp',
      description: 'Drowning in Slack, Asana, Jira, and Excel? Unify your strategic specs, project tasks, and leave records in one tab.'
    }
  },
  {
    path: 'use-cases/ghost-okrs',
    loadComponent: () => import('./pages/usecase-okrs/usecase-okrs.component').then(m => m.UsecaseOkrsComponent),
    data: {
      title: 'Make Ghost OKRs Real — xcorp',
      description: 'Don\'t let company goals rot in an invisible spreadsheet. Link quarterly objectives directly to daily tasks and sprints.'
    }
  },
  {
    path: 'use-cases/buried-leave',
    loadComponent: () => import('./pages/usecase-leave/usecase-leave.component').then(m => m.UsecaseLeaveComponent),
    data: {
      title: 'Prevent Buried Leave Requests — xcorp',
      description: 'Slack DMs are not a leave system. Auto-route requests, check calendar overlaps, and protect delivery deadlines.'
    }
  },
  {
    path: 'features',
    loadComponent: () => import('./pages/all-features/all-features.component').then(m => m.AllFeaturesComponent),
    data: {
      title: 'Complete Feature Directory — xcorp',
      description: 'Browse the entire XCorp platform capabilities. OKRs, task management, no-code workflows, payroll reports, and integrations.'
    }
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    data: {
      title: 'Flexible Pricing for Growing Teams — xcorp',
      description: 'Starter, Professional, and Enterprise tiers. Free 30-day trial, no credit card required, pause or cancel anytime.'
    }
  },
  {
    path: 'ai-assistant',
    loadComponent: () => import('./pages/ai/ai.component').then(m => m.AiComponent),
    data: {
      title: 'AI Operational Assistant — xcorp',
      description: 'An intelligent layer over your company data. Summarize weekly changes, identify workflow blockers, and query capacity.'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Sign In — xcorp',
      description: 'Access your xcorp unified workspace dashboard.'
    }
  },
  {
    path: 'signup/confirm',
    loadComponent: () => import('./pages/signup-confirm/signup-confirm.component').then(m => m.SignupConfirmComponent),
    data: {
      title: 'Confirm Your Account — xcorp',
      description: 'Confirm your email to complete your xcorp account setup.'
    }
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    data: {
      title: 'Create Free Account — xcorp',
      description: 'Start your 30-day free trial. Setup in 10 minutes.'
    }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: {
      title: 'Reset Password — xcorp',
      description: 'Recover your xcorp workspace account credentials.'
    }
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
