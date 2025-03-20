// src/app/modules/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../core/services/payment.service';
import { ColisService } from '../../core/services/colis.service';
import { PriseEnChargeService } from '../../core/services/prise-en-charge.service';
import { AuthService } from '../../core/services/auth.service';
import { Colis } from '../../core/models/colis.model';
import { PriseEnCharge } from '../../core/models/prise-en-charge.model';
import { User } from '../../core/models/user.model';
import { PaymentMethod } from '../../core/models/payment.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  currentUser: User | null = null;
  colisId: number | null = null;
  priseId: number | null = null;
  
  colis: Colis | null = null;
  prise: PriseEnCharge | null = null;
  
  paymentMethods: PaymentMethod[] = [];
  selectedMethod: PaymentMethod | null = null;
  
  loading = true;
  processing = false;
  success = false;
  
  paymentForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private colisService: ColisService,
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      cardNumber: ['', [Validators.pattern(/^\d{16}$/)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cardCvc: ['', [Validators.pattern(/^\d{3,4}$/)]],
      phoneNumber: ['', [Validators.pattern(/^\d{9,15}$/)]]
    });
  }
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Récupérer les paramètres
    this.route.queryParams.subscribe(params => {
      if (params['colisId']) {
        this.colisId = parseInt(params['colisId']);
      }
      
      if (params['priseId']) {
        this.priseId = parseInt(params['priseId']);
      }
      
      this.loadData();
    });
    
    // Charger les méthodes de paiement
    this.loadPaymentMethods();
    
    // Réagir aux changements de méthode de paiement
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(methodId => {
      this.selectedMethod = this.paymentMethods.find(m => m.idMethod === methodId) || null;
      this.updateValidation();
    });
  }
  
  loadData(): void {
    this.loading = true;
    
    // Si on a un ID de colis, le charger
    if (this.colisId) {
      this.colisService.getColisById(this.colisId)
        .subscribe({
          next: (colis) => {
            this.colis = colis;
            
            // Si on a aussi un ID de prise en charge, le charger
            if (this.priseId) {
              this.priseEnChargeService.getPriseEnChargeById(this.priseId)
                .pipe(finalize(() => {
                  this.loading = false;
                }))
                .subscribe({
                  next: (prise) => {
                    this.prise = prise;
                  },
                  error: (error) => {
                    console.error('Erreur lors du chargement de la prise en charge:', error);
                    this.snackBar.open('Erreur lors du chargement de la prise en charge', 'Fermer', {
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'bottom',
                      panelClass: ['error-snackbar']
                    });
                  }
                });
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement du colis:', error);
            this.snackBar.open('Erreur lors du chargement du colis', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            });
            this.loading = false;
          }
        });
    } else if (this.priseId) {
      // Si on a seulement un ID de prise en charge, le charger
      this.priseEnChargeService.getPriseEnChargeById(this.priseId)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe({
          next: (prise) => {
            this.prise = prise;
            
            // Si la prise en charge a un colis, le récupérer
            if (prise.colis) {
              this.colis = prise.colis;
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement de la prise en charge:', error);
            this.snackBar.open('Erreur lors du chargement de la prise en charge', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Si on n'a ni colis ni prise en charge, rediriger vers la liste des colis
      this.snackBar.open('Aucun colis ou trajet spécifié', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/colis']);
    }
  }
  
  loadPaymentMethods(): void {
    this.paymentService.getPaymentMethods()
      .subscribe({
        next: (methods) => {
          this.paymentMethods = methods.filter(m => m.isActive);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des méthodes de paiement:', error);
          this.snackBar.open('Erreur lors du chargement des méthodes de paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  updateValidation(): void {
    const cardNumber = this.paymentForm.get('cardNumber');
    const cardExpiry = this.paymentForm.get('cardExpiry');
    const cardCvc = this.paymentForm.get('cardCvc');
    const phoneNumber = this.paymentForm.get('phoneNumber');
    
    // Réinitialiser les validations
    cardNumber?.clearValidators();
    cardExpiry?.clearValidators();
    cardCvc?.clearValidators();
    phoneNumber?.clearValidators();
    
    if (this.selectedMethod) {
      switch (this.selectedMethod.methodName) {
        case 'Stripe':
        case 'PayPal':
          // Pour Stripe et PayPal, on a besoin des infos de carte
          cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
          cardExpiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
          cardCvc?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
          break;
        case 'Orange Money':
          // Pour Orange Money, on a besoin du numéro de téléphone
          phoneNumber?.setValidators([Validators.required, Validators.pattern(/^\d{9,15}$/)]);
          break;
      }
    }
    
    cardNumber?.updateValueAndValidity();
    cardExpiry?.updateValueAndValidity();
    cardCvc?.updateValueAndValidity();
    phoneNumber?.updateValueAndValidity();
  }
  
  processPayment(): void {
    if (!this.currentUser || !this.colis || !this.prise || !this.selectedMethod || this.paymentForm.invalid) {
      return;
    }
    
    this.processing = true;
    
    const paymentData = {
      userId: this.currentUser.idUser,
      colisId: this.colis.idColis,
      priseId: this.prise.idPrise,
      amount: this.colis.tarif,
      token: 'dummy-token', // Pour Stripe
      phoneNumber: this.paymentForm.get('phoneNumber')?.value,
      description: `Paiement du colis #${this.colis.idColis} de ${this.colis.villeDepart} à ${this.colis.villeArrivee}`,
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`
    };
    
    switch (this.selectedMethod.methodName) {
      case 'PayPal':
        this.processPaypalPayment(paymentData);
        break;
      case 'Stripe':
        this.processStripePayment(paymentData);
        break;
      case 'Orange Money':
        this.processOrangeMoneyPayment(paymentData);
        break;
      default:
        this.snackBar.open('Méthode de paiement non supportée', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        this.processing = false;
    }
  }
  
  processPaypalPayment(paymentData: any): void {
    this.paymentService.createPaypalPayment(paymentData)
      .pipe(finalize(() => {
        this.processing = false;
      }))
      .subscribe({
        next: (response) => {
          // Rediriger vers l'URL de paiement PayPal
          window.location.href = response.paymentUrl;
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement PayPal:', error);
          this.snackBar.open('Erreur lors du traitement du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  processStripePayment(paymentData: any): void {
    this.paymentService.createStripePayment(paymentData)
      .pipe(finalize(() => {
        this.processing = false;
      }))
      .subscribe({
        next: (response) => {
          // Simuler un paiement réussi
          this.success = true;
          
          // Mettre à jour le statut du colis et de la prise en charge
          this.updateStatus(response.paymentId);
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement Stripe:', error);
          this.snackBar.open('Erreur lors du traitement du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  processOrangeMoneyPayment(paymentData: any): void {
    this.paymentService.createOrangeMoneyPayment(paymentData)
      .pipe(finalize(() => {
        this.processing = false;
      }))
      .subscribe({
        next: (response) => {
          // Simuler un paiement réussi
          this.success = true;
          
          // Mettre à jour le statut du colis et de la prise en charge
          this.updateStatus(response.paymentId);
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement Orange Money:', error);
          this.snackBar.open('Erreur lors du traitement du paiement', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  updateStatus(paymentId: number): void {
    // Mettre à jour le statut du colis à "En cours"
    if (this.colis) {
      this.colis.statuts = { idStatut: 2, libelStatut: 'En cours' };
      
      this.colisService.updateColis({
        ...this.colis,
        file: null
      })
        .subscribe({
          next: () => {
            // Mettre à jour le statut de la prise en charge à "Accepté"
            if (this.prise) {
              this.prise.statuts = { idStatut: 5, libelStatut: 'Accepté' };
              
              this.priseEnChargeService.updatePriseEnCharge(this.prise.idPrise, this.prise)
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
          }
        });
    }
  }
  
  backToDetails(): void {
    if (this.colisId) {
      this.router.navigate(['/colis', this.colisId]);
    } else if (this.priseId) {
      this.router.navigate(['/trajet', this.priseId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
