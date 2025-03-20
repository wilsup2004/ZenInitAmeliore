// src/app/modules/dashboard/components/recent-trajets/recent-trajets.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PriseEnCharge } from '../../../../core/models/prise-en-charge.model';

@Component({
  selector: 'app-recent-trajets',
  template: `
    <div class="recent-trajets-container">
      <!-- État de chargement -->
      <div *ngIf="loading" class="loading-state">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Chargement des trajets...</p>
      </div>
      
      <!-- Aucun trajet -->
      <div *ngIf="!loading && trajets.length === 0" class="empty-state">
        <mat-icon>flight</mat-icon>
        <p>Aucun trajet récent</p>
        <button mat-raised-button color="primary" routerLink="/trajet/create">Déclarer un trajet</button>
      </div>
      
      <!-- Liste des trajets -->
      <div *ngIf="!loading && trajets.length > 0" class="trajets-list">
        <div *ngFor="let item of trajets" class="trajet-item" (click)="viewTrajetDetails(item.idPrise)">
          <div class="trajet-info">
            <div class="trajet-id">Trajet #{{ item.idPrise }}</div>
            <div class="trajet-trajet">
              <span>{{ item.villeDepart }}</span>
              <mat-icon>arrow_forward</mat-icon>
              <span>{{ item.villeArrivee }}</span>
            </div>
            <div class="trajet-details">
              <div class="trajet-detail">
                <mat-icon>flight_takeoff</mat-icon>
                <span>{{ item.dateDepart | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="trajet-detail">
                <mat-icon>flight_land</mat-icon>
                <span>{{ item.dateArrivee | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="trajet-detail" *ngIf="item.idVol">
                <mat-icon>flight</mat-icon>
                <span>Vol: {{ item.idVol }}</span>
              </div>
            </div>
          </div>
          <div class="trajet-status">
            <div class="status-badge" [ngClass]="getStatusClass(item.statuts.idStatut)">
              {{ item.statuts.libelStatut }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recent-trajets-container {
      min-height: 200px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 0;
      
      p {
        margin-top: 16px;
        color: var(--text-color-secondary);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 0;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--text-color-secondary);
        opacity: 0.5;
        margin-bottom: 16px;
      }
      
      p {
        margin-bottom: 16px;
        color: var(--text-color-secondary);
        font-size: 1.1rem;
      }
    }

    .trajets-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .trajet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--translucent-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--glow-effect);
      }
    }

    .trajet-info {
      flex: 1;
    }

    .trajet-id {
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 4px;
    }

    .trajet-trajet {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
      
      span {
        font-size: 0.9rem;
        color: var(--text-color);
      }
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--text-color-secondary);
      }
    }

    .trajet-details {
      display: flex;
      gap: 16px;
    }

    .trajet-detail {
      display: flex;
      align-items: center;
      gap: 4px;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--text-color-secondary);
      }
      
      span {
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }

    /* Couleurs des badges de statut */
    .status-created {
      background-color: rgba(33, 150, 243, 0.1);
      color: #2196f3;
      border: 1px solid rgba(33, 150, 243, 0.2);
    }

    .status-in-progress {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.2);
    }

    .status-completed {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .status-pending {
      background-color: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
      border: 1px solid rgba(156, 39, 176, 0.2);
    }

    .status-accepted {
      background-color: rgba(0, 150, 136, 0.1);
      color: #009688;
      border: 1px solid rgba(0, 150, 136, 0.2);
    }

    .status-rejected {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }

    .status-cancelled {
      background-color: rgba(158, 158, 158, 0.1);
      color: #9e9e9e;
      border: 1px solid rgba(158, 158, 158, 0.2);
    }

    .status-delivered {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .status-default {
      background-color: rgba(158, 158, 158, 0.1);
      color: #9e9e9e;
      border: 1px solid rgba(158, 158, 158, 0.2);
    }

    @media (max-width: 599px) {
      .trajet-details {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class RecentTrajetsComponent {
  @Input() trajets: PriseEnCharge[] = [];
  @Input() loading: boolean = false;
  
  constructor(private router: Router) {}
  
  // Récupérer la classe CSS pour le statut
  getStatusClass(idStatut: number): string {
    switch (idStatut) {
      case 1: // Créé
        return 'status-created';
      case 2: // En cours
        return 'status-in-progress';
      case 3: // Clôturé
        return 'status-completed';
      case 4: // En attente
        return 'status-pending';
      case 5: // Accepté
        return 'status-accepted';
      case 6: // Refusé
        return 'status-rejected';
      case 7: // Annulé
        return 'status-cancelled';
      case 8: // Livré
        return 'status-delivered';
      default:
        return 'status-default';
    }
  }
  
  // Naviguer vers les détails du trajet
  viewTrajetDetails(trajetId: number): void {
    this.router.navigate(['/trajet', trajetId]);
  }
}
