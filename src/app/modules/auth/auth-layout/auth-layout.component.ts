// src/app/modules/auth/auth-layout/auth-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Appliquer le thème actif
    const theme = this.themeService.getActiveTheme();
    this.themeService.setActiveTheme(theme);
  }

  changeTheme(themeName: string): void {
    const themes = this.themeService.getThemes();
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      this.themeService.setActiveTheme(theme);
    }
  }

  changeLanguage(languageCode: string): void {
    const languages = this.translationService.getLanguages();
    const language = languages.find(l => l.code === languageCode);
    if (language) {
      this.translationService.setLanguage(language);
    }
  }
}
