// src/app/modules/payment/payment-cancel/payment-cancel.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../core/services/payment.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.scss']
})
export class PaymentCancelComponent implements OnInit {
  paymentId: string | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) {}
  
  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['paymentId']) {
        this.paymentId = params['paymentId'];
        this.cancelPayment();
      } else {
        this.loading = false;
      }
    });
  }
  
  cancelPayment(): void {
    if (!this.paymentId) return;
    
    this.paymentService.updatePaymentStatus(parseInt(this.paymentId), 'CANCELLED')
      .pipe(finalize(() => {
        this.loading = false;
      }))
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
    this.router.navigate(['/payment'], { 
      queryParams: { 
        paymentId: this.paymentId 
      }
    });
  }
}
