// src/app/shared/components/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <mat-icon class="not-found-icon">error_outline</mat-icon>
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <button mat-raised-button color="primary" routerLink="/">
        Retour à l'accueil
      </button>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 0 24px;
    }

    .not-found-icon {
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
  `]
})
export class NotFoundComponent {}
