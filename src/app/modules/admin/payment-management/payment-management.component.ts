// src/app/modules/admin/payment-management/payment-management.component.ts
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Payment } from '../../../core/models/payment.model';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface PaymentFilter {
  status: string | null;
  methodId: number | null;
  dateMin: Date | null;
  dateMax: Date | null;
  searchText: string | null;
}

@Component({
  selector: 'app-payment-management',
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  loading = true;
  processing = false;
  currentUser: User | null = null;
  
  payments: Payment[] = [];
  dataSource: MatTableDataSource<Payment> = new MatTableDataSource<Payment>();
  displayedColumns: string[] = ['idPayment', 'paymentDate', 'user.nom', 'colis.idColis', 'paymentAmount', 'paymentMethod.methodName', 'paymentStatus', 'actions'];
  
  filter: PaymentFilter = {
    status: null,
    methodId: null,
    dateMin: null,
    dateMax: null,
    searchText: null
  };
  
  filterForm: FormGroup;
  
  // Listes pour les filtres
  paymentStatuses = [
    { value: null, label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'COMPLETED', label: 'Complété' },
    { value: 'FAILED', label: 'Échoué' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'REFUNDED', label: 'Remboursé' }
  ];
  
  paymentMethods: any[] = [];
  
  // Statistiques
  stats = {
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
    totalAmount: 0,
    completedAmount: 0
  };
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {
    this.filterForm = this.fb.group({
      status: [null],
      methodId: [null],
      dateMin: [null],
      dateMax: [null],
      searchText: ['']
    });
  }
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Charger les paiements
    this.loadPayments();
    
    // Charger les méthodes de paiement pour le filtre
    this.loadPaymentMethods();
    
    // S'abonner aux changements du formulaire
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.filter = {
          status: values.status,
          methodId: values.methodId,
          dateMin: values.dateMin,
          dateMax: values.dateMax,
          searchText: values.searchText ? values.searchText.trim() : null
        };
        
        this.applyFilters();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadPayments(): void {
    this.loading = true;
    
    this.adminService.getAllPayments()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (payments) => {
          this.payments = payments;
          this.dataSource.data = payments;
          
          // Configurer le tri et la pagination
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            
            // Définir une fonction de tri personnalisée
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'user.nom':
                  return item.user?.nom + ' ' + item.user?.prenom;
                case 'colis.idColis':
                  return item.colis?.idColis;
                case 'paymentMethod.methodName':
                  return item.paymentMethod?.methodName;
                default:
                  return item.paymentMethod?.methodName;
              }
            };
            
            // Définir un prédicat de filtre personnalisé
            this.dataSource.filterPredicate = (data: Payment, filter: string) => {
              const searchText = filter.toLowerCase();
              return data.user?.nom?.toLowerCase().includes(searchText) ||
                     data.user?.prenom?.toLowerCase().includes(searchText) ||
                     data.colis?.idColis?.toString().includes(searchText) ||
                     data.paymentMethod?.methodName?.toLowerCase().includes(searchText) ||
                     data.paymentStatus?.toLowerCase().includes(searchText) ||
                     data.transactionId?.toLowerCase().includes(searchText);
            };
          });
          
          // Calculer les statistiques
          this.calculateStats(payments);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paiements:', error);
          this.snackBar.open('Erreur lors du chargement des paiements', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadPaymentMethods(): void {
    // Récupérer les méthodes de paiement
    this.paymentService.getPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (methods: any) => {
          this.paymentMethods = [
            { idMethod: null, methodName: 'Toutes les méthodes' },
            ...methods
          ];
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des méthodes de paiement:', error);
        }
      });
  }
  
  calculateStats(payments: Payment[]): void {
    // Réinitialiser les statistiques
    this.stats = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      refunded: 0,
      totalAmount: 0,
      completedAmount: 0
    };
    
    // Calculer les statistiques
    payments.forEach(payment => {
      this.stats.total++;
      this.stats.totalAmount += payment.paymentAmount;
      
      switch (payment.paymentStatus) {
        case 'COMPLETED':
          this.stats.completed++;
          this.stats.completedAmount += payment.paymentAmount;
          break;
        case 'PENDING':
          this.stats.pending++;
          break;
        case 'FAILED':
          this.stats.failed++;
          break;
        case 'CANCELLED':
          this.stats.cancelled++;
          break;
        case 'REFUNDED':
          this.stats.refunded++;
          break;
      }
    });
  }
  
  applyFilters(): void {
    this.dataSource.data = this.payments.filter(payment => {
      // Filtrer par statut
      if (this.filter.status && payment.paymentStatus !== this.filter.status) {
        return false;
      }
      
      // Filtrer par méthode de paiement
      if (this.filter.methodId && payment.paymentMethod.idMethod !== this.filter.methodId) {
        return false;
      }
      
      // Filtrer par date min
      if (this.filter.dateMin && new Date(payment.paymentDate) < this.filter.dateMin) {
        return false;
      }
      
      // Filtrer par date max
      if (this.filter.dateMax && new Date(payment.paymentDate) > this.filter.dateMax) {
        return false;
      }
      
      // Filtrer par texte de recherche
      if (this.filter.searchText) {
        const searchText = this.filter.searchText.toLowerCase();
        return payment.user?.nom?.toLowerCase().includes(searchText) ||
               payment.user?.prenom?.toLowerCase().includes(searchText) ||
               payment.colis?.idColis?.toString().includes(searchText) ||
               payment.paymentMethod?.methodName?.toLowerCase().includes(searchText) ||
               payment.paymentStatus?.toLowerCase().includes(searchText) ||
               payment.transactionId?.toLowerCase().includes(searchText);
      }
      
      return true;
    });
    
    // Recalculer les statistiques pour les paiements filtrés
    this.calculateStats(this.dataSource.data);
    
    // Réinitialiser la pagination
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      status: null,
      methodId: null,
      dateMin: null,
      dateMax: null,
      searchText: ''
    });
  }
  
  updatePaymentStatus(payment: Payment, newStatus: string): void {
    if (!this.currentUser) return;
    
    // Confirmation
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: `Êtes-vous sûr de vouloir modifier le statut du paiement à "${newStatus}" ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.processing = true;
          
          this.adminService.updatePaymentStatus(payment.idPayment, newStatus, parseInt(this.currentUser!.idUser))
            .pipe(
              takeUntil(this.destroy$),
              finalize(() => {
                this.processing = false;
              })
            )
            .subscribe({
              next: (updatedPayment) => {
                // Mettre à jour le paiement dans la liste
                const index = this.payments.findIndex(p => p.idPayment === updatedPayment.idPayment);
                if (index !== -1) {
                  this.payments[index] = updatedPayment;
                  this.dataSource.data = [...this.payments];
                  
                  // Recalculer les statistiques
                  this.calculateStats(this.payments);
                }
                
                this.snackBar.open(`Statut du paiement mis à jour avec succès: ${newStatus}`, 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
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
      });
  }
  
  viewPaymentDetails(payment: Payment): void {
    // Afficher les détails du paiement dans un dialogue
    this.dialog.open(PaymentDetailsDialogComponent, {
      width: '600px',
      data: payment
    });
  }
  
  exportToCSV(): void {
    // Export des paiements filtrés au format CSV
    const csvData = this.convertToCSV(this.dataSource.data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'payments-export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  private convertToCSV(data: Payment[]): string {
    if (data.length === 0) return '';
    
    // En-têtes CSV
    const headers = [
      'ID', 
      'Date', 
      'Utilisateur', 
      'Colis', 
      'Montant', 
      'Méthode de paiement', 
      'Statut', 
      'Transaction ID'
    ];
    
    // Lignes de données
    const rows = data.map(payment => [
      payment.idPayment,
      new Date(payment.paymentDate).toLocaleString(),
      `${payment.user?.prenom} ${payment.user?.nom}`,
      payment.colis?.idColis,
      `${payment.paymentAmount} €`,
      payment.paymentMethod?.methodName,
      payment.paymentStatus,
      payment.transactionId
    ]);
    
    // Combiner en-têtes et lignes
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'REFUNDED':
        return 'status-refunded';
      default:
        return 'status-default';
    }
  }
}

// Composant de dialogue pour afficher les détails d'un paiement
@Component({
  selector: 'payment-details-dialog',
  template: `
    <h2 mat-dialog-title>Détails du paiement #{{data.idPayment}}</h2>
    <div mat-dialog-content>
      <div class="payment-detail-section">
        <h3>Informations générales</h3>
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{data.idPayment}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{formatDate(data.paymentDate)}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut:</span>
          <span class="detail-value">
            <span class="status-badge" [class]="getStatusClass(data.paymentStatus)">{{data.paymentStatus}}</span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">{{data.transactionId}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Montant:</span>
          <span class="detail-value">{{data.paymentAmount}} €</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Méthode:</span>
          <span class="detail-value">{{data.paymentMethod?.methodName}}</span>
        </div>
      </div>

      <hr class="divider">

      <div class="payment-detail-section">
        <h3>Utilisateur</h3>
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="detail-value">{{data.user?.idUser}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nom:</span>
          <span class="detail-value">{{data.user?.prenom}} {{data.user?.nom}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{data.user?.mail}}</span>
        </div>
      </div>

      <hr class="divider">

      <div class="payment-detail-section">
        <h3>Colis</h3>
        <div class="detail-row">
          <span class="detail-label">ID Colis:</span>
          <span class="detail-value">{{data.colis?.idColis}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trajet:</span>
          <span class="detail-value">{{data.colis?.villeDepart}} → {{data.colis?.villeArrivee}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Poids:</span>
          <span class="detail-value">{{data.colis?.nbKilo}} kg</span>
        </div>
      </div>

      <hr class="divider">

      <div class="payment-detail-section">
        <h3>Détails additionnels</h3>
        <pre class="payment-details-json">{{data.paymentDetails || 'Aucun détail supplémentaire'}}</pre>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </div>
  `,
  styles: [`
    .payment-detail-section {
      margin: 16px 0;
    }

    h3 {
      margin-top: 0;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }

    .detail-label {
      width: 130px;
      font-weight: 500;
      color: var(--text-color);
    }

    .detail-value {
      flex: 1;
      color: var(--text-color-secondary);
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .status-completed {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .status-pending {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .status-failed {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .status-cancelled {
      background-color: rgba(158, 158, 158, 0.1);
      color: #9e9e9e;
    }

    .status-refunded {
      background-color: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .payment-details-json {
      background-color: var(--translucent-bg);
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 0.85rem;
    }

    .divider {
      margin: 16px 0;
      border: none;
      border-top: 1px solid #ddd;
    }
  `]
})
export class PaymentDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Payment) {}
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'REFUNDED':
        return 'status-refunded';
      default:
        return '';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
}
