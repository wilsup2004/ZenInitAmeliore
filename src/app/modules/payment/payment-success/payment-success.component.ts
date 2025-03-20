// src/app/modules/payment/payment-success/payment-success.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../core/services/payment.service';
import { ColisService } from '../../../core/services/colis.service';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  loading = true;
  processingStatus = false;
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
    this.route.queryParams.subscribe(params => {
      if (params['paymentId']) {
        this.paymentId = params['paymentId'];
        this.verifyPayment();
      } else {
        this.loading = false;
        this.snackBar.open('Aucun identifiant de paiement trouvé', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  verifyPayment(): void {
    if (!this.paymentId) return;
    
    this.paymentService.getPaymentStatus(parseInt(this.paymentId))
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (payment) => {
          this.paymentDetails = payment;
          
          // Si le paiement n'est pas encore complété, mettre à jour son statut
          if (payment.status !== 'COMPLETED') {
            this.updatePaymentStatus(parseInt(this.paymentId!));
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification du paiement:', error);
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
      .pipe(finalize(() => {
        this.processingStatus = false;
      }))
      .subscribe({
        next: (payment) => {
          this.paymentDetails = payment;
          
          // Mettre à jour le statut du colis et de la prise en charge
          this.updateColisAndPriseStatus(payment);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut du paiement:', error);
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
      .subscribe({
        next: (colis) => {
          colis.statuts = { idStatut: 2, libelStatut: 'En cours' };
          
          this.colisService.updateColis({
            ...colis,
            file: null
          })
            .subscribe({
              next: () => {
                // Mettre à jour le statut de la prise en charge à "Accepté"
                this.priseEnChargeService.getPriseEnChargeById(payment.priseEnCharge.idPrise)
                  .subscribe({
                    next: (prise) => {
                      prise.statuts = { idStatut: 5, libelStatut: 'Accepté' };
                      
                      this.priseEnChargeService.updatePriseEnCharge(prise.idPrise, prise)
                        .subscribe({
                          next: () => {
                            this.snackBar.open('Paiement traité avec succès', 'Fermer', {
                              duration: 3000,
                              horizontalPosition: 'center',
                              verticalPosition: 'bottom'
                            });
                          }
                        });
                    }
                  });
              }
            });
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
}
