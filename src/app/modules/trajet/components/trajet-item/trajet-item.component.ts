// src/app/modules/trajet/components/trajet-item/trajet-item.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PriseEnCharge } from '../../../../core/models/prise-en-charge.model';

@Component({
  selector: 'app-trajet-item',
  templateUrl: './trajet-item.component.html',
  styleUrls: ['./trajet-item.component.scss']
})
export class TrajetItemComponent {
  @Input() trajet!: PriseEnCharge;
  
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
  viewTrajetDetails(): void {
    this.router.navigate(['/trajet', this.trajet.idPrise]);
  }
}
