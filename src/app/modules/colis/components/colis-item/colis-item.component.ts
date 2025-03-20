// src/app/modules/colis/components/colis-item/colis-item.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Colis } from '../../../../core/models/colis.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ColisService } from '../../../../core/services/colis.service';

@Component({
  selector: 'app-colis-item',
  templateUrl: './colis-item.component.html',
  styleUrls: ['./colis-item.component.scss']
})
export class ColisItemComponent {
  @Input() colis!: Colis;
  
  imageUrl: SafeUrl | null = null;
  imageLoading = true;
  
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private colisService: ColisService
  ) {}
  
  ngOnInit(): void {
    // Charger l'image du colis
    if (this.colis && this.colis.idColis) {
      this.loadColisImage(this.colis.idColis);
    }
  }
  
  loadColisImage(colisId: number): void {
    this.imageLoading = true;
    this.colisService.getColisImage(colisId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.imageLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'image:', error);
        this.imageLoading = false;
      }
    });
  }
  
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
  viewColisDetails(): void {
    this.router.navigate(['/colis', this.colis.idColis]);
  }
}
