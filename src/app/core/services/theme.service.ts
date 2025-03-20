// src/app/core/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  className: string;
  isDark: boolean;
  properties: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Liste des thèmes disponibles
  private themes: Theme[] = [
    {
      name: 'Cyber Neon',
      className: 'cyber-neon-theme',
      isDark: true,
      properties: {
        '--primary-color': '#0BC5EA',
        '--primary-color-gradient': 'linear-gradient(to right, #0BC5EA, #2B6CB0)',
        '--background-color': '#0A0E17',
        '--background-gradient': 'linear-gradient(to bottom right, #111827, #0F2942, #111827)',
        '--card-background': 'rgba(17, 25, 40, 0.8)',
        '--text-color': '#ffffff',
        '--text-color-secondary': '#A0AEC0',
        '--accent-color': 'rgb(6, 182, 212)',
        '--border-color': 'rgba(6, 182, 212, 0.5)',
        '--glow-effect': '0 0 15px rgba(6, 182, 212, 0.5)',
        '--hover-glow': '0 0 20px rgba(6, 182, 212, 0.7)',
        '--translucent-bg': 'rgba(255, 255, 255, 0.05)'
      }
    },
    {
      name: 'Sugar Candy',
      className: 'sugar-candy-theme',
      isDark: false,
      properties: {
        '--primary-color': '#D53F8C',
        '--primary-color-gradient': 'linear-gradient(to right, #D53F8C, #B83280)',
        '--background-color': '#FFF5F7',
        '--background-gradient': 'linear-gradient(to bottom right, #FFF5F7, #FFFFFF, #EBF8FF)',
        '--card-background': 'rgba(255, 255, 255, 0.8)',
        '--text-color': '#2D3748',
        '--text-color-secondary': '#718096',
        '--accent-color': '#D53F8C',
        '--border-color': '#FED7E2',
        '--glow-effect': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '--hover-glow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '--translucent-bg': 'rgba(255, 255, 255, 0.5)'
      }
    },
    {
      name: 'Emerald Ocean',
      className: 'emerald-ocean-theme',
      isDark: true,
      properties: {
        '--primary-color': '#10B981',
        '--primary-color-gradient': 'linear-gradient(to right, #10B981, #0D9488)',
        '--background-color': '#134E4A',
        '--background-gradient': 'linear-gradient(to bottom right, #134E4A, #115E59, #134E4A)',
        '--card-background': 'rgba(20, 83, 45, 0.3)',
        '--text-color': '#ffffff',
        '--text-color-secondary': '#A7F3D0',
        '--accent-color': '#10B981',
        '--border-color': 'rgba(20, 184, 166, 0.5)',
        '--glow-effect': '0 0 15px rgba(20, 184, 166, 0.5)',
        '--hover-glow': '0 0 20px rgba(20, 184, 166, 0.7)',
        '--translucent-bg': 'rgba(255, 255, 255, 0.05)'
      }
    },
    {
      name: 'Cosmic Purple',
      className: 'cosmic-purple-theme',
      isDark: true,
      properties: {
        '--primary-color': '#8B5CF6',
        '--primary-color-gradient': 'linear-gradient(to right, #8B5CF6, #D946EF)',
        '--background-color': '#0F172A',
        '--background-gradient': 'linear-gradient(to bottom right, #0F172A, #2E1065, #0F172A)',
        '--card-background': 'rgba(30, 41, 59, 0.5)',
        '--text-color': '#ffffff',
        '--text-color-secondary': '#CBD5E1',
        '--accent-color': '#A855F7',
        '--border-color': 'rgba(168, 85, 247, 0.5)',
        '--glow-effect': '0 0 15px rgba(168, 85, 247, 0.4)',
        '--hover-glow': '0 0 20px rgba(168, 85, 247, 0.6)',
        '--translucent-bg': 'rgba(255, 255, 255, 0.05)'
      }
    }
  ];

  // Thème par défaut
  private activeTheme = new BehaviorSubject<Theme>(this.themes[0]);
  activeTheme$ = this.activeTheme.asObservable();

  constructor() {
    // Récupérer le thème sauvegardé dans le localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.name === savedTheme);
      if (theme) {
        this.setActiveTheme(theme);
      }
    }
  }

  // Obtenir tous les thèmes disponibles
  getThemes(): Theme[] {
    return this.themes;
  }

  // Obtenir le thème actif
  getActiveTheme(): Theme {
    return this.activeTheme.value;
  }

  // Définir le thème actif
  setActiveTheme(theme: Theme): void {
    // Sauvegarder le thème dans le localStorage
    localStorage.setItem('theme', theme.name);
    
    // Mettre à jour les propriétés CSS
    Object.keys(theme.properties).forEach(property => {
      document.documentElement.style.setProperty(property, theme.properties[property]);
    });
    
    // Si c'est un thème sombre, ajouter la classe dark-theme au body
    if (theme.isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Mettre à jour le thème actif
    this.activeTheme.next(theme);
  }
}
