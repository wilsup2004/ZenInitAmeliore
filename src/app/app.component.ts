// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { TranslationService } from './core/services/translation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading$: Observable<boolean>;

  constructor(
    private loadingService: LoadingService,
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    // Appliquer le thème sauvegardé
    const theme = this.themeService.getActiveTheme();
    this.themeService.setActiveTheme(theme);

    // Charger les traductions pour la langue active
    const language = this.translationService.getCurrentLanguage();
    this.translationService.getTranslations(language.code);
  }
}
