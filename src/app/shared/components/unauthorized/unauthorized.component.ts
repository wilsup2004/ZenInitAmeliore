// src/app/shared/components/unauthorized/unauthorized.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-icon class="unauthorized-icon">lock</mat-icon>
      <h1>403</h1>
      <h2>Accès refusé</h2>
      <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
      <div class="button-group">
        <button mat-raised-button color="primary" routerLink="/">
          Retour à l'accueil
        </button>
        <button mat-stroked-button routerLink="/auth/login">
          Se connecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 0 24px;
    }

    .unauthorized-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--text-color-secondary, #888);
      opacity: 0.5;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 6rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-color, #333);
    }

    h2 {
      font-size: 2rem;
      font-weight: 500;
      margin: 16px 0;
      color: var(--text-color, #333);
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 32px;
      color: var(--text-color-secondary, #888);
    }

    .button-group {
      display: flex;
      gap: 16px;
    }

    @media (max-width: 480px) {
      .button-group {
        flex-direction: column;
      }
    }
  `]
})
export class UnauthorizedComponent {}
