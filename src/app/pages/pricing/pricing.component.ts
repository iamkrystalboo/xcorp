import { Component } from '@angular/core';
import { NgIf, NgClass, NgFor, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';

interface PricingTier {
  combo: number;
  retail: number;
}

interface CalculatorModule {
  id: string;
  name: string;
  priceBasic: number;
  pricePro: number;
  checked: boolean;
  descBasic: string;
  descPro: string;
}

interface FAQItem {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [NgIf, NgClass, NgFor, UpperCasePipe, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {
  // Toggle: monthly (Hàng tháng) | sixmonths (6 tháng - 10% off) | yearly (Hàng năm - 20% off)
  pricingCycle: 'monthly' | 'sixmonths' | 'yearly' = 'monthly';
  
  // Toggle: combo vs retail (mua lẻ)
  isComboMode: boolean = true;

  // Base prices per user per month (Monthly rates)
  basePrices: Record<string, PricingTier> = {
    free: { combo: 0, retail: 0 },
    basic: { combo: 4, retail: 6 },
    professional: { combo: 7, retail: 10 }
  };

  // Calculator State
  calculatorTier: 'basic' | 'professional' = 'basic';
  userCount: number = 10;

  calculatorModules: CalculatorModule[] = [
    { 
      id: 'task', 
      name: 'Task & Project Management', 
      priceBasic: 1, 
      pricePro: 3, 
      checked: true, 
      descBasic: 'Kanban/List view, active sprints, backlog, basic epics & releases', 
      descPro: 'Includes Basic + Storyline roadmaps, Gantt charts, Scrum projects, task templates' 
    },
    { 
      id: 'okr', 
      name: 'OKR Board (Goal Tracking)', 
      priceBasic: 1, 
      pricePro: 3, 
      checked: true, 
      descBasic: 'Set objectives & key results, basic cycle management and permissions', 
      descPro: 'Includes Basic + advanced templates (aggregation, risk, progress), personal dashboards' 
    },
    { 
      id: 'timesheet', 
      name: 'Timesheet & Logwork', 
      priceBasic: 1, 
      pricePro: 1, 
      checked: false, 
      descBasic: 'Personal time logs, payroll-ready reports, basic time sheet settings', 
      descPro: 'Full tracking, approvals, and compliance export' 
    },
    { 
      id: 'leave', 
      name: 'Leave & Attendance', 
      priceBasic: 1, 
      pricePro: 1, 
      checked: false, 
      descBasic: 'Leave requests, basic multi-level approval flows, balance summaries', 
      descPro: 'Full balance configurations, GPS check-in rules, and calendar sync' 
    },
    { 
      id: 'document', 
      name: 'Document Hub', 
      priceBasic: 1, 
      pricePro: 1, 
      checked: false, 
      descBasic: 'Internal document sharing, storage and company wikis', 
      descPro: 'Full document templates, dynamic fields, and folders permission' 
    },
    { 
      id: 'auditlog', 
      name: 'Audit Log (Security)', 
      priceBasic: 1, 
      pricePro: 1, 
      checked: false, 
      descBasic: 'Trace changes and activities with up to 2-month history retention', 
      descPro: 'Trace changes and security logs with up to 6-month history retention' 
    },
    { 
      id: 'workflow', 
      name: 'Workflow Automation', 
      priceBasic: 1, 
      pricePro: 2, 
      checked: false, 
      descBasic: 'No-code workflow designer (includes 50 runs/user/month, extra runs at $0.02/run)', 
      descPro: 'Full designer + integrated Data Tables (includes 100 runs/user/month, extra runs at $0.02/run)' 
    }
  ];

  faqContent: FAQItem[] = [
    {
      q: 'What are the limits of the FREE plan?',
      a: 'The FREE plan is completely free for up to 10 users and 5 projects, with 2.5GB of company-wide storage. It includes basic task tracking but does not support OKRs, workflows, timesheets, or leave management.',
      open: false
    },
    {
      q: 'How does Combo pricing compare to buying individual modules?',
      a: 'You can purchase individual modules (e.g., only Task tracking or only Leave approvals) starting at $1 - $3/user/month. If you need 3 or more modules, our Combo packages save you 30% - 33%, costing just $4/user/month for BASIC or $7/user/month for PROFESSIONAL (on monthly billing).',
      open: false
    },
    {
      q: 'Do you offer discounts for long-term billing?',
      a: 'Yes! If you choose long-term billing, you receive an additional discount on your monthly rate: 10% off for 6-month billing and 20% off for annual billing. This discount applies to both Combo packages and custom module selections.',
      open: false
    },
    {
      q: 'What features are included in the HR & People Ops modules?',
      a: 'These modules automate time tracking (Timesheets, Logwork) and employee request routing (Leave dashboard, approvals, balance check, reporting). They are fully included in both BASIC and PROFESSIONAL tiers to help eliminate spreadsheet chaos.',
      open: false
    },
    {
      q: 'How are workflow automation runs counted?',
      a: 'BASIC users receive 50 runs/user/month, and PROFESSIONAL users receive 100 runs/user/month. Runs are pooled across your entire organization, meaning users who automate heavily can use runs allocated from other team members.',
      open: false
    },
    {
      q: 'What is included in the Enterprise plan?',
      a: 'The Enterprise plan is designed for large organizations with strict security requirements, dedicated infrastructure needs (Private Cloud or On-premise), guaranteed support SLA, and source code access for internal core integrations. Contact sales for a customized quote.',
      open: false
    }
  ];

  constructor(private modalService: ModalService) {}

  setPricingCycle(cycle: 'monthly' | 'sixmonths' | 'yearly'): void {
    this.pricingCycle = cycle;
  }

  setPricingMode(isCombo: boolean): void {
    this.isComboMode = isCombo;
  }

  toggleFaq(item: FAQItem): void {
    item.open = !item.open;
  }

  openFreeTrial(): void {
    this.modalService.openModal('freetrial');
  }

  openContactSales(): void {
    this.modalService.openModal('sales');
  }

  openScheduleDemo(): void {
    this.modalService.openModal('demo');
  }

  // --- Calculations for UI Cards ---
  getCycleDiscountMultiplier(): number {
    if (this.pricingCycle === 'sixmonths') return 0.9; // 10% off
    if (this.pricingCycle === 'yearly') return 0.8; // 20% off
    return 1.0;
  }

  getTierPrice(tier: 'free' | 'basic' | 'professional', modeOverride?: 'combo' | 'retail'): number {
    if (tier === 'free') return 0;
    
    const mode = modeOverride !== undefined ? modeOverride : (this.isComboMode ? 'combo' : 'retail');
    const basePrice = this.basePrices[tier][mode];
    const discounted = basePrice * this.getCycleDiscountMultiplier();
    
    // Return rounded to 1 decimal place to support prices like $3.6 or $3.2 nicely
    return Math.round(discounted * 10) / 10;
  }

  // --- Pricing Calculator Actions & Calculations ---
  setCalculatorTier(tier: 'basic' | 'professional'): void {
    this.calculatorTier = tier;
    
    // Auto-check core modules based on tier default behavior if needed, or keep current selection
    if (tier === 'basic') {
      // Basic core modules defaults
      this.calculatorModules.forEach(mod => {
        if (mod.id === 'task' || mod.id === 'okr') mod.checked = true;
      });
    } else {
      // Pro core modules defaults
      this.calculatorModules.forEach(mod => {
        if (mod.id === 'task' || mod.id === 'okr') mod.checked = true;
      });
    }
  }

  getModulePrice(mod: CalculatorModule): number {
    return this.calculatorTier === 'basic' ? mod.priceBasic : mod.pricePro;
  }

  getCalculatorCustomPricePerUser(): number {
    const sum = this.calculatorModules
      .filter(m => m.checked)
      .reduce((acc, m) => acc + this.getModulePrice(m), 0);
    
    const discounted = sum * this.getCycleDiscountMultiplier();
    return Math.round(discounted * 10) / 10;
  }

  getCalculatorCustomPriceTotalPerMonth(): number {
    return Math.round(this.getCalculatorCustomPricePerUser() * this.userCount * 10) / 10;
  }

  getCalculatorComboPricePerUser(): number {
    const baseCombo = this.basePrices[this.calculatorTier].combo;
    const discounted = baseCombo * this.getCycleDiscountMultiplier();
    return Math.round(discounted * 10) / 10;
  }

  getCalculatorComboPriceTotalPerMonth(): number {
    return Math.round(this.getCalculatorComboPricePerUser() * this.userCount * 10) / 10;
  }

  getCalculatorSavingsPerMonth(): number {
    const customTotal = this.getCalculatorCustomPriceTotalPerMonth();
    const comboTotal = this.getCalculatorComboPriceTotalPerMonth();
    const savings = customTotal - comboTotal;
    return savings > 0 ? Math.round(savings * 10) / 10 : 0;
  }

  isComboBetter(): boolean {
    return this.getCalculatorSavingsPerMonth() > 0;
  }

  scrollToPackage(tier: 'basic' | 'professional'): void {
    const element = document.getElementById(`pricing-card-${tier}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Trigger card highlight animation
      element.classList.add('card-highlight-flash');
      
      // Remove class after animation finishes
      setTimeout(() => {
        element.classList.remove('card-highlight-flash');
      }, 1500);
    }
  }

  openQuoteModal(): void {
    const selectedModules = this.calculatorModules
      .filter(m => m.checked)
      .map(m => m.name);

    this.modalService.quoteData.set({
      tier: this.calculatorTier,
      users: this.userCount,
      modules: selectedModules,
      pricePerUser: this.getCalculatorCustomPricePerUser(),
      priceTotal: this.getCalculatorCustomPriceTotalPerMonth()
    });

    this.modalService.openModal('quote');
  }
}

