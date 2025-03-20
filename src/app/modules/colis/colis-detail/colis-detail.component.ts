// src/app/modules/colis/colis-detail/colis-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColisService } from '../../../core/services/colis.service';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { AuthService } from '../../../core/services/auth.service';
import { Colis } from '../../../core/models/colis.model';
import { User } from '../../../core/models/user.model';
import { PriseEnCharge } from '../../../core/models/prise-en-charge.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-colis-detail',
  templateUrl: './colis-detail.component.html',
  styleUrls: ['./colis-detail.component.scss']
})
export class ColisDetailComponent implements OnInit {
  colisId: number = 0;
  colis: Colis | null = null;
  currentUser: User | null = null;
  priseEnCharge: PriseEnCharge | null = null;
  
  imageUrl: SafeUrl | null = null;
  loading = true;
  
  // États d'affichage
  isOwner = false;
  canTakeColis = false;
  canContactOwner = false;
  canPay = false;
  canCancel = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private colisService: ColisService,
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Récupérer l'ID du colis depuis l'URL
    this.route.params.subscribe(params => {
      this.colisId = +params['id'];
      this.loadColisData();
    });
  }
  
  loadColisData(): void {
    this.loading = true;
    
    // Charger les données du colis
    this.colisService.getColisById(this.colisId)
      .pipe(
        switchMap(colis => {
          this.colis = colis;
          
          // Vérifier si l'utilisateur est le propriétaire du colis
          if (this.currentUser && this.colis.users.idUser === this.currentUser.idUser) {
            this.isOwner = true;
          }
          
          // Vérifier si l'utilisateur peut prendre en charge le colis
          if (this.currentUser && !this.isOwner && this.colis.statuts.idStatut === 1) {
            this.canTakeColis = true;
          }
          
          // Vérifier si l'utilisateur peut contacter le propriétaire
          if (this.currentUser && !this.isOwner) {
            this.canContactOwner = true;
          }
          
          // Charger l'image du colis
          this.loadColisImage();
          
          // Vérifier si le colis a une prise en charge
          if (this.colis.priseEnCharges && this.colis.priseEnCharges.length > 0) {
            return this.priseEnChargeService.getPriseEnChargeByColis(this.colisId);
          }
          
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (priseEnCharge: PriseEnCharge | null) => {
          if (priseEnCharge) {
            this.priseEnCharge = priseEnCharge;
            
            // Vérifier si l'utilisateur peut payer
            if (this.isOwner && this.priseEnCharge.statuts.idStatut === 5) {
              this.canPay = true;
            }
            
            // Vérifier si l'utilisateur peut annuler
            if ((this.isOwner || (this.currentUser && this.priseEnCharge.users.idUser === this.currentUser.idUser)) 
                && [2, 4, 5].includes(this.priseEnCharge.statuts.idStatut)) {
              this.canCancel = true;
            }
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la prise en charge:', error);
          this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadColisImage(): void {
    if (!this.colis) return;
    
    this.colisService.getColisImage(this.colisId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'image:', error);
      }
    });
  }
  
  takeColis(): void {
    if (!this.currentUser || !this.colis) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir prendre en charge ce colis ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Créer une nouvelle prise en charge
        const priseEnCharge: PriseEnCharge = {
          idPrise: 0,
          colis: this.colis!,
          statuts: { idStatut: 4, libelStatut: 'En attente' },
          users: this.currentUser!,
          idVol: '',
          villeDepart: this.colis!.villeDepart,
          dateDepart: new Date(),
          villeArrivee: this.colis!.villeArrivee,
          dateArrivee: new Date()
        };
        
        // Mettre à jour le statut du colis
        this.colis!.statuts = { idStatut: 4, libelStatut: 'En attente' };
        
        this.priseEnChargeService.createPriseEnCharge(priseEnCharge)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe({
            next: () => {
              this.snackBar.open('Prise en charge effectuée avec succès', 'Fermer', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
              this.loadColisData();
            },
            error: (error) => {
              console.error('Erreur lors de la prise en charge:', error);
              this.snackBar.open('Erreur lors de la prise en charge', 'Fermer', {
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
  
  cancelPriseEnCharge(): void {
    if (!this.priseEnCharge) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir annuler cette prise en charge ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Mettre à jour le statut
        this.priseEnCharge!.statuts = { idStatut: 7, libelStatut: 'Annulé' };
        if (this.colis) {
          this.colis.statuts = { idStatut: 7, libelStatut: 'Annulé' };
        }
        
        this.priseEnChargeService.annulerPriseEnCharge(this.priseEnCharge.idPrise, this.priseEnCharge)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe({
            next: () => {
              this.snackBar.open('Annulation effectuée avec succès', 'Fermer', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
              this.loadColisData();
            },
            error: (error) => {
              console.error('Erreur lors de l\'annulation:', error);
              this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', {
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
    if (!this.colis) return;
    
    // Rediriger vers la messagerie avec l'ID de l'utilisateur propriétaire
    this.router.navigate(['/messaging'], { 
      queryParams: { 
        userId: this.colis.users.idUser,
        colisId: this.colisId
      } 
    });
  }
  
  goToPayment(): void {
    if (!this.colis || !this.priseEnCharge) return;
    
    // Rediriger vers le paiement
    this.router.navigate(['/payment'], { 
      queryParams: { 
        colisId: this.colisId,
        priseId: this.priseEnCharge.idPrise
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
  
  // Calculer le volume du colis
  calculateVolume(): number {
    if (!this.colis) return 0;
    
    const longueur = this.colis.longueur || 0;
    const largeur = this.colis.largeur || 0;
    const hauteur = this.colis.hauteur || 0;
    
    return longueur * largeur * hauteur;
  }
}
