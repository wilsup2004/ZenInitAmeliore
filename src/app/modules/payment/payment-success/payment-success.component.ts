// src/app/modules/payment/payment-success/payment-success.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../core/services/payment.service';
import { ColisService } from '../../../core/services/colis.service';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  paymentId: string | null = null;
  loading = true;
  processingStatus = false;
  error = false;
  errorMessage = '';
  paymentDetails: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private colisService: ColisService,
    private priseEnChargeService: PriseEnChargeService
  ) {}
  
  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['paymentId']) {
          this.paymentId = params['paymentId'];
          this.verifyPayment();
        } else {
          this.loading = false;
          this.error = true;
          this.errorMessage = 'Aucun identifiant de paiement trouvé';
          this.snackBar.open('Aucun identifiant de paiement trouvé', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    
    // Vérifier si un paiement était en cours (stocké dans localStorage)
    const pendingPaymentId = localStorage.getItem('pendingPaymentId');
    if (pendingPaymentId && !this.paymentId) {
      this.paymentId = pendingPaymentId;
      this.verifyPayment();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  verifyPayment(): void {
    if (!this.paymentId) return;
    
    this.paymentService.getPaymentStatus(parseInt(this.paymentId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (payment) => {
          this.paymentDetails = payment;
          
          // Si le paiement n'est pas encore complété, mettre à jour son statut
          if (payment.paymentStatus !== 'COMPLETED') {
            this.updatePaymentStatus(parseInt(this.paymentId!));
          } else {
            // Supprimer l'ID du paiement en attente
            localStorage.removeItem('pendingPaymentId');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification du paiement:', error);
          this.error = true;
          this.errorMessage = 'Erreur lors de la vérification du paiement';
          this.snackBar.open('Erreur lors de la vérification du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  updatePaymentStatus(paymentId: number): void {
    this.processingStatus = true;
    
    this.paymentService.updatePaymentStatus(paymentId, 'COMPLETED')
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.processingStatus = false;
        })
      )
      .subscribe({
        next: (payment) => {
          this.paymentDetails = payment;
          
          // Mettre à jour le statut du colis et de la prise en charge
          this.updateColisAndPriseStatus(payment);
          
          // Supprimer l'ID du paiement en attente
          localStorage.removeItem('pendingPaymentId');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut du paiement:', error);
          this.error = true;
          this.errorMessage = 'Erreur lors de la mise à jour du statut du paiement';
          this.snackBar.open('Erreur lors de la mise à jour du statut du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  updateColisAndPriseStatus(payment: any): void {
    // Mettre à jour le statut du colis à "En cours"
    this.colisService.getColisById(payment.colis.idColis)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (colis) => {
          colis.statuts = { idStatut: 2, libelStatut: 'En cours' };
          
          // Créer un objet FormData pour l'envoi
          const formData = new FormData();
          
          // Ajouter les données du colis au FormData
          formData.append('idColis', colis.idColis.toString());
          formData.append('statuts', JSON.stringify(colis.statuts));
          formData.append('longueur', colis.longueur.toString());
          formData.append('largeur', colis.largeur.toString());
          formData.append('hauteur', colis.hauteur.toString());
          formData.append('nbKilo', colis.nbKilo.toString());
          formData.append('tarif', colis.tarif.toString());
          formData.append('villeDepart', colis.villeDepart);
          formData.append('villeArrivee', colis.villeArrivee);
          formData.append('description', colis.description);
          
          this.colisService.updateColis(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                // Mettre à jour le statut de la prise en charge à "Accepté"
                this.priseEnChargeService.getPriseEnChargeById(payment.priseEnCharge.idPrise)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (prise) => {
                      prise.statuts = { idStatut: 5, libelStatut: 'Accepté' };
                      
                      this.priseEnChargeService.updatePriseEnCharge(prise.idPrise, prise)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                          next: () => {
                            this.snackBar.open('Paiement traité avec succès', 'Fermer', {
                              duration: 3000,
                              horizontalPosition: 'center',
                              verticalPosition: 'bottom'
                            });
                          },
                          error: (error) => {
                            console.error('Erreur lors de la mise à jour de la prise en charge:', error);
                            // Ne pas bloquer l'expérience utilisateur, le paiement est réussi
                          }
                        });
                    },
                    error: (error) => {
                      console.error('Erreur lors de la récupération de la prise en charge:', error);
                      // Ne pas bloquer l'expérience utilisateur, le paiement est réussi
                    }
                  });
              },
              error: (error) => {
                console.error('Erreur lors de la mise à jour du colis:', error);
                // Ne pas bloquer l'expérience utilisateur, le paiement est réussi
              }
            });
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du colis:', error);
          // Ne pas bloquer l'expérience utilisateur, le paiement est réussi
        }
      });
  }
  
  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  
  viewColis(): void {
    if (this.paymentDetails && this.paymentDetails.colis) {
      this.router.navigate(['/colis', this.paymentDetails.colis.idColis]);
    } else {
      this.backToDashboard();
    }
  }
  
  retryPayment(): void {
    if (this.paymentDetails && this.paymentDetails.colis && this.paymentDetails.priseEnCharge) {
      this.router.navigate(['/payment'], { 
        queryParams: { 
          colisId: this.paymentDetails.colis.idColis,
          priseId: this.paymentDetails.priseEnCharge.idPrise
        }
      });
    } else {
      this.backToDashboard();
    }
  }
}
