// src/app/modules/layout/components/language-selector/language-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { TranslationService, Language } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [];
  currentLanguage: Language;

  constructor(private translationService: TranslationService) {
    this.languages = this.translationService.getLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  changeLanguage(language: Language): void {
    this.translationService.setLanguage(language);
  }
}
