import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private modalService = inject(ModalService);
  private translationService = inject(TranslationService);

  currentLang = this.translationService.currentLang;

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  openFreeTrial(event: Event): void {
    event.preventDefault();
    this.modalService.openModal('freetrial');
  }

  openDemo(event: Event): void {
    event.preventDefault();
    this.modalService.openModal('demo');
  }
}
