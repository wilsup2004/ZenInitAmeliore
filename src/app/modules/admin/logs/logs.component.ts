// src/app/modules/admin/logs/logs.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminLog } from '../../../core/models/admin.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = true;
  dataSource: MatTableDataSource<AdminLog> = new MatTableDataSource<AdminLog>();
  displayedColumns: string[] = ['actionDate', 'adminUser.user.nom', 'actionType', 'actionDetails'];
  
  filterForm: FormGroup;
  
  // Options de filtrage
  actionTypes = [
    { value: '', label: 'Tous les types d\'action' },
    { value: 'CREATE_ADMIN', label: 'Création d\'administrateur' },
    { value: 'UPDATE_ADMIN_LEVEL', label: 'Modification de niveau d\'administrateur' },
    { value: 'REMOVE_ADMIN', label: 'Suppression d\'administrateur' },
    { value: 'DISABLE_USER', label: 'Désactivation d\'utilisateur' },
    { value: 'ENABLE_USER', label: 'Activation d\'utilisateur' },
    { value: 'UPDATE_COLIS_STATUS', label: 'Modification de statut de colis' },
    { value: 'UPDATE_PAYMENT_STATUS', label: 'Modification de statut de paiement' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      actionType: [''],
      startDate: [null],
      endDate: [null],
      adminId: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadLogs();
    
    // S'abonner aux changements du formulaire de filtrage
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadLogs(page: number = 0, size: number = 20): void {
    this.loading = true;
    
    this.adminService.getAdminLogs(page, size)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (data) => {
          this.dataSource.data = data.content;
          
          // Configuration de la pagination et du tri
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            
            // Définir une fonction de tri personnalisée pour le nom d'administrateur
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'adminUser.user.nom':
                  return item.adminUser.user.nom + ' ' + item.adminUser.user.prenom;
                default:
                  return item.actionType;
              }
            };
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des logs:', error);
          this.snackBar.open('Erreur lors du chargement des logs', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Filtrer par type d'action
    if (filters.actionType) {
      this.adminService.getLogsByActionType(filters.actionType)
        .subscribe({
          next: (logs) => {
            this.dataSource.data = logs;
          },
          error: (error) => {
            console.error('Erreur lors du filtrage des logs:', error);
          }
        });
    }
    // Filtrer par plage de dates
    else if (filters.startDate && filters.endDate) {
      this.adminService.getLogsByDateRange(filters.startDate, filters.endDate)
        .subscribe({
          next: (logs) => {
            this.dataSource.data = logs;
          },
          error: (error) => {
            console.error('Erreur lors du filtrage des logs:', error);
          }
        });
    }
    // Filtrer par administrateur
    else if (filters.adminId) {
      this.adminService.getAdminLogsByAdmin(parseInt(filters.adminId))
        .subscribe({
          next: (logs) => {
            this.dataSource.data = logs;
          },
          error: (error) => {
            console.error('Erreur lors du filtrage des logs:', error);
          }
        });
    }
    // Aucun filtre spécifique, recharger tous les logs
    else {
      this.loadLogs();
    }
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      actionType: '',
      startDate: null,
      endDate: null,
      adminId: ''
    });
    this.loadLogs();
  }
  
  applyTextFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  // Formater la date pour l'affichage
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
  
  // Pagination
  onPageChange(event: any): void {
    this.loadLogs(event.pageIndex, event.pageSize);
  }
}
