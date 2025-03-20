// src/app/modules/trajet/trajet-detail/trajet-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { ColisService } from '../../../core/services/colis.service';
import { AuthService } from '../../../core/services/auth.service';
import { PriseEnCharge } from '../../../core/models/prise-en-charge.model';
import { Colis } from '../../../core/models/colis.model';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-trajet-detail',
  templateUrl: './trajet-detail.component.html',
  styleUrls: ['./trajet-detail.component.scss']
})
export class TrajetDetailComponent implements OnInit {
  trajetId: number = 0;
  trajet: PriseEnCharge | null = null;
  currentUser: User | null = null;
  matchingColis: Colis[] = [];
  
  loading = true;
  loadingColis = true;
  
  // États d'affichage
  isOwner = false;
  canCancel = false;
  canContact = false;
  canRequestAssociation = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private priseEnChargeService: PriseEnChargeService,
    private colisService: ColisService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Récupérer l'ID du trajet depuis l'URL
    this.route.params.subscribe(params => {
      this.trajetId = +params['id'];
      this.loadTrajetData();
    });
  }
  
  loadTrajetData(): void {
    this.loading = true;
    
    // Charger les données du trajet
    this.priseEnChargeService.getPriseEnChargeById(this.trajetId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (trajet) => {
          this.trajet = trajet;
          
          // Vérifier si l'utilisateur est le propriétaire du trajet
          if (this.currentUser && this.trajet.users.idUser === this.currentUser.idUser) {
            this.isOwner = true;
          }
          
          // Vérifier si l'utilisateur peut annuler le trajet
          if (this.isOwner && [1, 2, 4].includes(this.trajet.statuts.idStatut)) {
            this.canCancel = true;
          }
          
          // Vérifier si l'utilisateur peut contacter le propriétaire
          if (this.currentUser && !this.isOwner) {
            this.canContact = true;
          }
          
          // Vérifier si l'utilisateur peut demander une association de colis
          if (this.currentUser && !this.isOwner) {
            this.canRequestAssociation = true;
          }
          
          // Charger les colis qui correspondent au trajet
          this.loadMatchingColis();
        },
        error: (error) => {
          console.error('Erreur lors du chargement du trajet:', error);
          this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadMatchingColis(): void {
    if (!this.trajet) return;
    
    this.loadingColis = true;
    
    // Si l'utilisateur est le propriétaire du trajet, charger les colis qui correspondent au trajet
    if (this.isOwner) {
      this.colisService.getColisByTrajetAndStatut(
        this.trajet.villeDepart,
        this.trajet.villeArrivee,
        1
      )
      .pipe(finalize(() => {
        this.loadingColis = false;
      }))
      .subscribe({
        next: (colis) => {
          this.matchingColis = colis;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des colis:', error);
          this.snackBar.open('Erreur lors du chargement des colis', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Si l'utilisateur n'est pas le propriétaire, charger ses propres colis qui correspondent au trajet
      if (this.currentUser) {
        this.colisService.getColisByTrajetAndStatut(
          this.trajet.villeDepart,
          this.trajet.villeArrivee,
          1,
          this.currentUser.idUser
        )
        .pipe(finalize(() => {
          this.loadingColis = false;
        }))
        .subscribe({
          next: (colis) => {
            this.matchingColis = colis;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des colis:', error);
            this.snackBar.open('Erreur lors du chargement des colis', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        this.loadingColis = false;
      }
    }
  }
  
  cancelTrajet(): void {
    if (!this.trajet) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir annuler ce trajet ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Mettre à jour le statut du trajet
        this.trajet!.statuts = { idStatut: 7, libelStatut: 'Annulé' };
        
        this.priseEnChargeService.annulerPriseEnCharge(this.trajet!.idPrise, this.trajet!)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe({
            next: () => {
              this.snackBar.open('Trajet annulé avec succès', 'Fermer', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
              this.loadTrajetData();
            },
            error: (error) => {
              console.error('Erreur lors de l\'annulation du trajet:', error);
              this.snackBar.open('Erreur lors de l\'annulation du trajet', 'Fermer', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }
  
  contactOwner(): void {
    if (!this.trajet) return;
    
    // Rediriger vers la messagerie avec l'ID de l'utilisateur propriétaire
    this.router.navigate(['/messaging'], { 
      queryParams: { 
        userId: this.trajet.users.idUser,
        trajetId: this.trajetId
      } 
    });
  }
  
  viewColisDetails(colisId: number): void {
    this.router.navigate(['/colis', colisId]);
  }
  
  associateColis(colisId: number): void {
    if (!this.trajet || !this.currentUser) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir associer ce colis au trajet ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Récupérer le colis
        const colis = this.matchingColis.find(c => c.idColis === colisId);
        if (colis) {
          // Mettre à jour le statut du colis
          colis.statuts = { idStatut: 4, libelStatut: 'En attente' };
          
          // Créer une prise en charge
          const priseEnCharge: PriseEnCharge = {
            idPrise: 0,
            colis: colis,
            statuts: { idStatut: 4, libelStatut: 'En attente' },
            users: this.trajet!.users,
            idVol: this.trajet!.idVol,
            villeDepart: this.trajet!.villeDepart,
            dateDepart: this.trajet!.dateDepart,
            villeArrivee: this.trajet!.villeArrivee,
            dateArrivee: this.trajet!.dateArrivee
          };
          
          this.priseEnChargeService.createPriseEnCharge(priseEnCharge)
            .pipe(finalize(() => {
              this.loading = false;
            }))
            .subscribe({
              next: () => {
                this.snackBar.open('Demande d\'association envoyée avec succès', 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
                this.loadMatchingColis();
              },
              error: (error) => {
                console.error('Erreur lors de l\'association du colis:', error);
                this.snackBar.open('Erreur lors de l\'association du colis', 'Fermer', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      }
    });
  }
  
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
}
