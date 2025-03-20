// src/app/modules/payment/payment-cancel/payment-cancel.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../core/services/payment.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.scss']
})
export class PaymentCancelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  paymentId: string | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  paymentDetails: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) {}
  
  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['paymentId']) {
          this.paymentId = params['paymentId'];
          this.cancelPayment();
        } else {
          // Vérifier si un paiement était en cours (stocké dans localStorage)
          const pendingPaymentId = localStorage.getItem('pendingPaymentId');
          if (pendingPaymentId) {
            this.paymentId = pendingPaymentId;
            this.cancelPayment();
          } else {
            this.loading = false;
          }
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  cancelPayment(): void {
    if (!this.paymentId) {
      this.loading = false;
      return;
    }
    
    this.paymentService.getPaymentStatus(parseInt(this.paymentId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payment) => {
          this.paymentDetails = payment;
          this.updatePaymentStatus();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du paiement:', error);
          this.loading = false;
          this.error = true;
          this.errorMessage = 'Erreur lors de la récupération du paiement';
        }
      });
  }
  
  updatePaymentStatus(): void {
    if (!this.paymentId) return;
    
    this.paymentService.updatePaymentStatus(parseInt(this.paymentId), 'CANCELLED')
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          // Supprimer l'ID du paiement en attente
          localStorage.removeItem('pendingPaymentId');
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Paiement annulé', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation du paiement:', error);
          this.error = true;
          this.errorMessage = 'Erreur lors de l\'annulation du paiement';
          this.snackBar.open('Erreur lors de l\'annulation du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  
  retryPayment(): void {
    if (this.paymentDetails && this.paymentDetails.colis && this.paymentDetails.priseEnCharge) {
      this.router.navigate(['/payment'], { 
        queryParams: { 
          colisId: this.paymentDetails.colis.idColis,
          priseId: this.paymentDetails.priseEnCharge.idPrise
        }
      });
    } else if (this.paymentId) {
      this.router.navigate(['/payment'], { 
        queryParams: { 
          paymentId: this.paymentId 
        }
      });
    } else {
      this.router.navigate(['/payment']);
    }
  }
}
