import { Injectable, signal, WritableSignal } from '@angular/core';

export type Lang = 'en' | 'vi';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  currentLang: WritableSignal<Lang>;

  private translations: Record<Lang, Record<string, any>> = { en: {}, vi: {} };
  private loaded: Record<Lang, boolean> = { en: false, vi: false };
  private loading: Record<Lang, Promise<void> | null> = { en: null, vi: null };

  constructor() {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('xcorp_lang')) as Lang | null;
    const initial: Lang = stored === 'vi' ? 'vi' : 'en';
    this.currentLang = signal<Lang>(initial);
    // Preload both languages to avoid flicker
    this.loadLang('en');
    this.loadLang('vi');
  }

  private async loadLang(lang: Lang): Promise<void> {
    if (this.loaded[lang]) return;
    if (this.loading[lang]) return this.loading[lang]!;

    this.loading[lang] = fetch(`/assets/i18n/${lang}.json`)
      .then(r => r.json())
      .then(data => {
        this.translations[lang] = data;
        this.loaded[lang] = true;
      })
      .catch(() => {
        console.warn(`[i18n] Failed to load ${lang}.json`);
      });

    return this.loading[lang]!;
  }

  toggleLanguage(): void {
    const next: Lang = this.currentLang() === 'en' ? 'vi' : 'en';
    this.setLanguage(next);
  }

  setLanguage(lang: Lang): void {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('xcorp_lang', lang);
    }
    this.loadLang(lang);
  }

  /**
   * Translate a dot-notation key, e.g. 'header.products'
   * Falls back to the key itself if not found.
   */
  translate(key: string): string {
    const lang = this.currentLang();
    const dict = this.translations[lang];
    const result = this.resolve(dict, key);
    if (result !== undefined && result !== null) return String(result);

    // Fallback to English
    if (lang !== 'en') {
      const enResult = this.resolve(this.translations['en'], key);
      if (enResult !== undefined && enResult !== null) return String(enResult);
    }

    return key;
  }

  /**
   * Get a translation value that may be an array or object (for complex data like FAQ).
   */
  translateData<T = any>(key: string): T {
    const lang = this.currentLang();
    const dict = this.translations[lang];
    const result = this.resolve(dict, key);
    if (result !== undefined && result !== null) return result as T;

    // Fallback to English
    if (lang !== 'en') {
      const enResult = this.resolve(this.translations['en'], key);
      if (enResult !== undefined && enResult !== null) return enResult as T;
    }

    return key as unknown as T;
  }

  private resolve(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    const keys = path.split('.');
    let current = obj;
    for (const k of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[k];
    }
    return current;
  }
}
