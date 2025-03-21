// src/app/modules/payment/payment.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  colisId: number | null = null;
  priseId: number | null = null;
  paymentId: number | null = null; // Pour gérer les paiements en cours
  
  colis: Colis | null = null;
  prise: PriseEnCharge | null = null;
  
  paymentMethods: PaymentMethod[] = [];
  selectedMethod: PaymentMethod | null = null;
  
  loading = true;
  processing = false;
  success = false;
  error = false;
  errorMessage = '';
  
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
      phoneNumber: ['', [Validators.pattern(/^\d{9,15}$/)]],
      cardName: ['', [Validators.minLength(3)]] // Ajout du nom du titulaire de la carte
    });
  }
  
  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
    
    // Récupérer les paramètres
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['colisId']) {
          this.colisId = parseInt(params['colisId']);
        }
        
        if (params['priseId']) {
          this.priseId = parseInt(params['priseId']);
        }
        
        if (params['paymentId']) {
          this.paymentId = parseInt(params['paymentId']);
          this.resumePayment(this.paymentId);
        } else {
          this.loadData();
        }
      });
    
    // Charger les méthodes de paiement
    this.loadPaymentMethods();
    
    // Réagir aux changements de méthode de paiement
    this.paymentForm.get('paymentMethod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(methodId => {
        this.selectedMethod = this.paymentMethods.find(m => m.idMethod === methodId) || null;
        this.updateValidation();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadData(): void {
    this.loading = true;
    this.error = false;
    
    // Si on a un ID de colis, le charger
    if (this.colisId) {
      this.colisService.getColisById(this.colisId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (colis) => {
            this.colis = colis;
            
            // Si on a aussi un ID de prise en charge, le charger
            if (this.priseId) {
              this.loadPriseEnCharge();
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement du colis:', error);
            this.handleError('Erreur lors du chargement du colis');
          }
        });
    } else if (this.priseId) {
      // Si on a seulement un ID de prise en charge, le charger
      this.loadPriseEnCharge();
    } else {
      // Si on n'a ni colis ni prise en charge, rediriger vers la liste des colis
      this.handleError('Aucun colis ou trajet spécifié');
      this.router.navigate(['/colis']);
    }
  }
  
  loadPriseEnCharge(): void {
    if (!this.priseId) return;
    
    this.priseEnChargeService.getPriseEnChargeById(this.priseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (prise) => {
          this.prise = prise;
          
          // Si la prise en charge a un colis et qu'on n'a pas déjà chargé le colis
          if (prise.colis && !this.colis) {
            this.colis = prise.colis;
            this.colisId = prise.colis.idColis;
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la prise en charge:', error);
          this.handleError('Erreur lors du chargement de la prise en charge');
        }
      });
  }
  
  resumePayment(paymentId: number): void {
    this.loading = true;
    this.error = false;
    
    this.paymentService.getPaymentStatus(paymentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (payment) => {
          // Si le paiement est déjà complété
          if (payment.paymentStatus === 'COMPLETED') {
            this.success = true;
            this.colis = payment.colis;
            this.prise = payment.priseEnCharge;
          } 
          // Si le paiement est en attente ou créé
          else if (['PENDING', 'CREATED'].includes(payment.paymentStatus)) {
            this.colisId = payment.colis.idColis;
            this.priseId = payment.priseEnCharge.idPrise;
            this.colis = payment.colis;
            this.prise = payment.priseEnCharge;
            
            // Sélectionner la méthode de paiement
            const methodId = payment.paymentMethod.idMethod;
            this.paymentForm.get('paymentMethod')?.setValue(methodId);
          } 
          // Si le paiement a échoué ou a été annulé
          else {
            this.colisId = payment.colis.idColis;
            this.priseId = payment.priseEnCharge.idPrise;
            this.loadData();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du paiement:', error);
          this.handleError('Erreur lors de la récupération du paiement');
          if (this.colisId || this.priseId) {
            this.loadData();
          }
        }
      });
  }
  
  loadPaymentMethods(): void {
    this.paymentService.getPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (methods) => {
          this.paymentMethods = methods.filter(m => m.isActive);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des méthodes de paiement:', error);
          this.handleError('Erreur lors du chargement des méthodes de paiement');
        }
      });
  }
  
  updateValidation(): void {
    const cardNumber = this.paymentForm.get('cardNumber');
    const cardExpiry = this.paymentForm.get('cardExpiry');
    const cardCvc = this.paymentForm.get('cardCvc');
    const cardName = this.paymentForm.get('cardName');
    const phoneNumber = this.paymentForm.get('phoneNumber');
    
    // Réinitialiser les validations
    cardNumber?.clearValidators();
    cardExpiry?.clearValidators();
    cardCvc?.clearValidators();
    cardName?.clearValidators();
    phoneNumber?.clearValidators();
    
    if (this.selectedMethod) {
      switch (this.selectedMethod.methodName) {
        case 'Stripe':
        case 'PayPal':
          // Pour Stripe et PayPal, on a besoin des infos de carte
          cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
          cardExpiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
          cardCvc?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
          cardName?.setValidators([Validators.required, Validators.minLength(3)]);
          break;
        case 'Orange Money':
        case 'Mobile Money':
          // Pour Mobile Money, on a besoin du numéro de téléphone
          phoneNumber?.setValidators([Validators.required, Validators.pattern(/^\d{9,15}$/)]);
          break;
      }
    }
    
    cardNumber?.updateValueAndValidity();
    cardExpiry?.updateValueAndValidity();
    cardCvc?.updateValueAndValidity();
    cardName?.updateValueAndValidity();
    phoneNumber?.updateValueAndValidity();
  }
  
  processPayment(): void {
    if (!this.currentUser || !this.colis || !this.prise || !this.selectedMethod || this.paymentForm.invalid) {
      return;
    }
    
    this.processing = true;
    this.error = false;
    
    const paymentData = {
      userId: this.currentUser.idUser,
      colisId: this.colis.idColis,
      priseId: this.prise.idPrise,
      amount: this.colis.tarif,
      methodId: this.selectedMethod.idMethod,
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      // Informations de carte
      ...(this.selectedMethod.methodName === 'Stripe' || this.selectedMethod.methodName === 'PayPal' ? {
        cardNumber: this.paymentForm.get('cardNumber')?.value,
        cardExpiry: this.paymentForm.get('cardExpiry')?.value,
        cardCvc: this.paymentForm.get('cardCvc')?.value,
        cardName: this.paymentForm.get('cardName')?.value
      } : {}),
      // Informations de mobile money
      ...(this.selectedMethod.methodName === 'Orange Money' || this.selectedMethod.methodName === 'Mobile Money' ? {
        phoneNumber: this.paymentForm.get('phoneNumber')?.value
      } : {})
    };
    
    switch (this.selectedMethod.methodName) {
      case 'PayPal':
        this.processPaypalPayment(paymentData);
        break;
      case 'Stripe':
        this.processStripePayment(paymentData);
        break;
      case 'Orange Money':
      case 'Mobile Money':
        this.processMobileMoneyPayment(paymentData);
        break;
      default:
        this.handleError('Méthode de paiement non supportée');
        this.processing = false;
    }
  }
  
  processPaypalPayment(paymentData: any): void {
    this.paymentService.createPaypalPayment(paymentData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Stocker l'ID du paiement dans localStorage pour reprise éventuelle
          localStorage.setItem('pendingPaymentId', response.paymentId.toString());
          
          // Rediriger vers l'URL de paiement PayPal
          window.location.href = response.paymentUrl;
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement PayPal:', error);
          this.handleError('Erreur lors du traitement du paiement');
        }
      });
  }
  
  processStripePayment(paymentData: any): void {
    this.paymentService.createStripePayment(paymentData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.requiresAction) {
            // Pour 3D Secure, rediriger vers la page de vérification
            window.location.href = response.actionUrl;
          } else {
            // Paiement réussi
            this.success = true;
            this.updateStatus(response.paymentId);
          }
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement Stripe:', error);
          this.handleError(error.error?.message || 'Erreur lors du traitement du paiement');
        }
      });
  }
  
  processMobileMoneyPayment(paymentData: any): void {
    this.paymentService.createOrangeMoneyPayment(paymentData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.requiresConfirmation) {
            // Afficher un message indiquant qu'une confirmation est nécessaire
            this.snackBar.open('Veuillez confirmer le paiement sur votre téléphone', 'Fermer', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
            
            // Vérifier le statut du paiement toutes les 5 secondes
            this.checkPaymentStatus(response.paymentId);
          } else {
            // Paiement réussi
            this.success = true;
            this.updateStatus(response.paymentId);
          }
        },
        error: (error) => {
          console.error('Erreur lors du traitement du paiement Orange Money:', error);
          this.handleError(error.error?.message || 'Erreur lors du traitement du paiement');
        }
      });
  }
  
  // Fonction pour vérifier périodiquement le statut du paiement
  checkPaymentStatus(paymentId: number, attempts: number = 0): void {
    if (attempts > 12) { // 1 minute maximum (12 * 5 secondes)
      this.handleError('La confirmation du paiement a expiré');
      return;
    }
    
    setTimeout(() => {
      this.paymentService.getPaymentStatus(paymentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (payment) => {
            if (payment.paymentStatus === 'COMPLETED') {
              this.success = true;
              this.updateStatus(paymentId);
            } else if (['FAILED', 'CANCELLED'].includes(payment.paymentStatus)) {
              this.handleError('Le paiement a échoué ou a été annulé');
            } else {
              // Continuer à vérifier
              this.checkPaymentStatus(paymentId, attempts + 1);
            }
          },
          error: (error) => {
            console.error('Erreur lors de la vérification du statut du paiement:', error);
            this.handleError('Erreur lors de la vérification du paiement');
          }
        });
    }, 5000); // Vérifier toutes les 5 secondes
  }
  
  updateStatus(paymentId: number): void {
    // Mettre à jour le statut du colis à "En cours"
    if (this.colis) {
      this.colis.statuts = { idStatut: 2, libelStatut: 'En cours' };
      
      // Créer un objet FormData pour l'envoi
      const formData = new FormData();
      
      // Ajouter les données du colis au FormData
      formData.append('idColis', this.colis.idColis.toString());
      formData.append('statuts', JSON.stringify(this.colis.statuts));
      
      // Ajouter les autres propriétés importantes du colis
      if (this.colis.longueur) formData.append('longueur', this.colis.longueur.toString());
      if (this.colis.largeur) formData.append('largeur', this.colis.largeur.toString());
      if (this.colis.hauteur) formData.append('hauteur', this.colis.hauteur.toString());
      if (this.colis.nbKilo) formData.append('nbKilo', this.colis.nbKilo.toString());
      if (this.colis.tarif) formData.append('tarif', this.colis.tarif.toString());
      if (this.colis.villeDepart) formData.append('villeDepart', this.colis.villeDepart);
      if (this.colis.villeArrivee) formData.append('villeArrivee', this.colis.villeArrivee);
      if (this.colis.description) formData.append('description', this.colis.description);
      if (this.colis.users) formData.append('users', JSON.stringify(this.colis.users));
      
      this.colisService.updateColis(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Mettre à jour le statut de la prise en charge à "Accepté"
            if (this.prise) {
              this.prise.statuts = { idStatut: 5, libelStatut: 'Accepté' };
              
              this.priseEnChargeService.updatePriseEnCharge(this.prise.idPrise, this.prise)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.snackBar.open('Paiement traité avec succès', 'Fermer', {
                      duration: 3000,
                      horizontalPosition: 'center',
                      verticalPosition: 'bottom'
                    });
                    
                    // Supprimer l'ID du paiement en attente
                    localStorage.removeItem('pendingPaymentId');
                  },
                  error: (error) => {
                    console.error('Erreur lors de la mise à jour de la prise en charge:', error);
                    // On ne bloque pas l'utilisateur, le paiement a réussi
                  }
                });
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du colis:', error);
            // On ne bloque pas l'utilisateur, le paiement a réussi
          }
        });
    }
  }
  
  handleError(message: string): void {
    this.error = true;
    this.errorMessage = message;
    this.loading = false;
    
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
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
  
  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.paymentForm.reset();
    this.error = false;
    this.success = false;
  }
}
