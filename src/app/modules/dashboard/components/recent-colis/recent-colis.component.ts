// src/app/modules/dashboard/components/recent-colis/recent-colis.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Colis } from '../../../../core/models/colis.model';

@Component({
  selector: 'app-recent-colis',
  templateUrl: './recent-colis.component.html',
  styleUrls: ['./recent-colis.component.scss']
})
export class RecentColisComponent {
  @Input() colis: Colis[] = [];
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
  
  // Naviguer vers les détails du colis
  viewColisDetails(colisId: number): void {
    this.router.navigate(['/colis', colisId]);
  }
}
