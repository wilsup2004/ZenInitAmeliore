// src/app/core/services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

export interface Language {
  code: string;
  name: string;
}

interface TranslationData {
  [key: string]: any;
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
  private translationsCache: { [key: string]: Observable<TranslationData> } = {};
  
  // Cache des données de traduction résolues
  private translationsData: { [key: string]: TranslationData } = {};

  constructor(private http: HttpClient) {
    // Récupérer la langue sauvegardée dans le localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const language = this.languages.find(l => l.code === savedLanguage);
      if (language) {
        this.setLanguage(language);
      }
    }
    
    // Précharger les traductions pour la langue courante
    this.loadTranslations(this.currentLanguage.value.code);
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
    
    // Précharger les traductions pour cette langue
    this.loadTranslations(language.code);
  }

  // Précharger les traductions pour une langue spécifique
  private loadTranslations(lang: string): void {
    this.getTranslations(lang).subscribe(data => {
      this.translationsData[lang] = data;
    });
  }

  // Charger les traductions pour une langue spécifique
  getTranslations(lang: string): Observable<TranslationData> {
    if (!this.translationsCache[lang]) {
      // Charger les traductions depuis le serveur et les mettre en cache
      this.translationsCache[lang] = this.http.get<TranslationData>(`/assets/i18n/${lang}.json`).pipe(
        tap(data => {
          // Stocker les données résolues
          this.translationsData[lang] = data;
        }),
        shareReplay(1)
      );
    }
    return this.translationsCache[lang];
  }

  // Traduire une clé
  translate(key: string, params: { [key: string]: string } = {}): string {
    const lang = this.currentLanguage.value.code;
    const translationData = this.translationsData[lang];

    if (!translationData) {
      return key; // Retourner la clé si les traductions ne sont pas encore chargées
    }

    // Récupérer la traduction pour la clé en naviguant dans l'objet
    let result: any = translationData;
    const keys = key.split('.');
    
    for (const k of keys) {
      if (result === undefined || result === null) {
        return key; // La traduction n'existe pas, retourner la clé
      }
      result = result[k];
    }
    
    // Si la traduction n'est pas une chaîne de caractères, retourner la clé
    if (typeof result !== 'string') {
      return key;
    }
    
    // Remplacer les paramètres
    let translation = result;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    
    return translation;
  }
}