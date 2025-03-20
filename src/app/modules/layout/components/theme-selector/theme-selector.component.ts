// src/app/modules/layout/components/theme-selector/theme-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService, Theme } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent implements OnInit {
  themes: Theme[] = [];
  activeTheme: Theme;

  constructor(private themeService: ThemeService) {
    this.themes = this.themeService.getThemes();
    this.activeTheme = this.themeService.getActiveTheme();
  }

  ngOnInit(): void {
    this.themeService.activeTheme$.subscribe(theme => {
      this.activeTheme = theme;
    });
  }

  changeTheme(theme: Theme): void {
    this.themeService.setActiveTheme(theme);
  }
}
