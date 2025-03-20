// src/app/core/services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface Language {
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // Langues disponibles
  private languages: Language[] = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
  ];

  // Langue par défaut (français)
  private currentLanguage = new BehaviorSubject<Language>(this.languages[0]);
  currentLanguage$ = this.currentLanguage.asObservable();

  // Cache des traductions
  private translationsCache: { [key: string]: Observable<any> } = {};

  constructor(private http: HttpClient) {
    // Récupérer la langue sauvegardée dans le localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const language = this.languages.find(l => l.code === savedLanguage);
      if (language) {
        this.setLanguage(language);
      }
    }
  }

  // Obtenir toutes les langues disponibles
  getLanguages(): Language[] {
    return this.languages;
  }

  // Obtenir la langue active
  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }

  // Définir la langue active
  setLanguage(language: Language): void {
    // Sauvegarder la langue dans le localStorage
    localStorage.setItem('language', language.code);
    
    // Mettre à jour la langue active
    this.currentLanguage.next(language);
  }

  // Charger les traductions pour une langue spécifique
  getTranslations(lang: string): Observable<any> {
    if (!this.translationsCache[lang]) {
      // Charger les traductions depuis le serveur et les mettre en cache
      this.translationsCache[lang] = this.http.get(`/assets/i18n/${lang}.json`).pipe(
        shareReplay(1)
      );
    }
    return this.translationsCache[lang];
  }

  // Traduire une clé
  translate(key: string, params: { [key: string]: string } = {}): string {
    const lang = this.currentLanguage.value.code;
    const translations = this.translationsCache[lang];

    if (!translations) {
      return key;
    }

    // Récupérer la traduction pour la clé
    let translation = key.split('.').reduce((obj, i) => (obj && obj[i]) ? obj[i] : key, translations);
    
    // Remplacer les paramètres
    if (typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  }
}
