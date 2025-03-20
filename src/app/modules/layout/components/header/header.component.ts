// src/app/modules/layout/components/header/header.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { TranslationService, Language } from '../../../../core/services/translation.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidenavEvent = new EventEmitter<void>();
  @Input() unreadMessagesCount = 0;
  
  currentUser$: Observable<User | null>;
  activeTheme: Theme;
  currentLanguage: Language;
  themes: Theme[];
  languages: Language[];
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.activeTheme = this.themeService.getActiveTheme();
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.themes = this.themeService.getThemes();
    this.languages = this.translationService.getLanguages();
  }

  ngOnInit(): void {
    // S'abonner aux changements de thème
    this.themeService.activeTheme$.subscribe(theme => {
      this.activeTheme = theme;
    });
    
    // S'abonner aux changements de langue
    this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  toggleSidenav(): void {
    this.toggleSidenavEvent.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  changeTheme(theme: Theme): void {
    this.themeService.setActiveTheme(theme);
  }

  changeLanguage(language: Language): void {
    this.translationService.setLanguage(language);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToMessages(): void {
    this.router.navigate(['/messaging']);
  }
}
