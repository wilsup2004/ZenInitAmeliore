// src/app/modules/dashboard/components/activity-feed/activity-feed.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-feed',
  template: `
    <div class="activity-feed-container">
      <!-- Loading state -->
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="30"></mat-spinner>
        <p>Chargement des activités...</p>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!loading && activities.length === 0" class="empty-state">
        <mat-icon>history</mat-icon>
        <p>Aucune activité récente</p>
      </div>
      
      <!-- Activities list -->
      <div *ngIf="!loading && activities.length > 0" class="activities-list">
        <div *ngFor="let activity of activities" class="activity-item">
          <div class="activity-icon" [ngClass]="'activity-' + activity.type">
            <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-details">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.date | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-feed-container {
      height: 100%;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      
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
      padding: 40px 0;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--text-color-secondary);
        opacity: 0.5;
        margin-bottom: 16px;
      }
      
      p {
        color: var(--text-color-secondary);
      }
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      background-color: var(--translucent-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: white;
      }
    }

    .activity-colis {
      background-color: #4CAF50;
    }

    .activity-prise {
      background-color: #2196F3;
    }

    .activity-content {
      flex: 1;
      
      .activity-title {
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 4px;
      }
      
      .activity-details {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
        margin-bottom: 4px;
      }
      
      .activity-time {
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ActivityFeedComponent {
  @Input() activities: any[] = [];
  @Input() loading: boolean = false;
  
  getActivityIcon(type: string): string {
    switch (type) {
      case 'colis':
        return 'inventory_2';
      case 'prise':
        return 'check_circle';
      default:
        return 'event_note';
    }
  }
}
