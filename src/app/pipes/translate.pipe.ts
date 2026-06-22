import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Must be impure to react to language signal changes
})
export class TranslatePipe implements PipeTransform {
  private ts = inject(TranslationService);

  transform(key: string, fallback?: string): string {
    // Access the signal to trigger change detection when language changes
    this.ts.currentLang();
    const val = this.ts.translate(key);
    return val === key && fallback ? fallback : val;
  }
}
