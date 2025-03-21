// src/app/modules/admin/colis-management/colis-management.component.ts
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Colis, Statut } from '../../../core/models/colis.model';
import { User } from '../../../core/models/user.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-colis-management',
  templateUrl: './colis-management.component.html',
  styleUrls: ['./colis-management.component.scss']
})
export class ColisManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('statusDialog') statusDialog!: TemplateRef<any>;
  
  loading = true;
  currentUser: User | null = null;
  dataSource: MatTableDataSource<Colis> = new MatTableDataSource<Colis>();
  displayedColumns: string[] = ['idColis', 'user', 'villeDepart', 'villeArrivee', 'horodatage', 'nbKilo', 'tarif', 'statut', 'actions'];
  
  filterForm: FormGroup;
  statusForm: FormGroup;
  
  selectedColis: Colis | null = null;
  
  // Statuts pour le filtre
  statuts = [
    { id: null, libel: 'Tous les statuts' },
    { id: 1, libel: 'Créé' },
    { id: 2, libel: 'En cours' },
    { id: 3, libel: 'Clôturé' },
    { id: 4, libel: 'En attente' },
    { id: 5, libel: 'Accepté' },
    { id: 6, libel: 'Refusé' },
    { id: 7, libel: 'Annulé' },
    { id: 8, libel: 'Livré' }
  ];
  
  // Tous les statuts pour le changement de statut
  allStatuts: Statut[] = [
    { idStatut: 1, libelStatut: 'Créé' },
    { idStatut: 2, libelStatut: 'En cours' },
    { idStatut: 3, libelStatut: 'Clôturé' },
    { idStatut: 4, libelStatut: 'En attente' },
    { idStatut: 5, libelStatut: 'Accepté' },
    { idStatut: 6, libelStatut: 'Refusé' },
    { idStatut: 7, libelStatut: 'Annulé' },
    { idStatut: 8, libelStatut: 'Livré' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      statut: [null],
      villeDepart: [''],
      villeArrivee: [''],
      userId: ['']
    });
    
    this.statusForm = this.fb.group({
      statutId: [null, Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadColis();
    
    // Réagir aux changements du formulaire de filtre
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadColis(): void {
    this.loading = true;
    
    this.adminService.getAllColis()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (colis) => {
          this.dataSource.data = colis;
          
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            
            // Définir une fonction de tri personnalisée
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'user':
                  return item.users.nom + ' ' + item.users.prenom;
                case 'statut':
                  return item.statuts.libelStatut;
                default:
                  return item.statuts.libelStatut;
              }
            };
            
            // Définir une fonction de filtrage personnalisée
            this.dataSource.filterPredicate = (data: Colis, filter: string) => {
              const searchText = filter.toLowerCase();
              return (
                data.idColis.toString().includes(searchText) ||
                data.users.nom.toLowerCase().includes(searchText) ||
                data.users.prenom.toLowerCase().includes(searchText) ||
                data.villeDepart.toLowerCase().includes(searchText) ||
                data.villeArrivee.toLowerCase().includes(searchText) ||
                data.statuts.libelStatut.toLowerCase().includes(searchText)
              );
            };
          });
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
  }
  
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Réinitialiser le filtre de texte
    this.dataSource.filter = '';
    
    // Filtrer par statut
    if (filters.statut !== null) {
      this.dataSource.data = this.dataSource.data.filter(colis => 
        colis.statuts.idStatut === filters.statut
      );
    }
    
    // Filtrer par ville de départ
    if (filters.villeDepart) {
      this.dataSource.data = this.dataSource.data.filter(colis => 
        colis.villeDepart.toLowerCase().includes(filters.villeDepart.toLowerCase())
      );
    }
    
    // Filtrer par ville d'arrivée
    if (filters.villeArrivee) {
      this.dataSource.data = this.dataSource.data.filter(colis => 
        colis.villeArrivee.toLowerCase().includes(filters.villeArrivee.toLowerCase())
      );
    }
    
    // Filtrer par ID utilisateur
    if (filters.userId) {
      this.dataSource.data = this.dataSource.data.filter(colis => 
        colis.users.idUser.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }
    
    // Mettre à jour le paginateur
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      statut: null,
      villeDepart: '',
      villeArrivee: '',
      userId: ''
    });
    this.loadColis();
  }
  
  applyTextFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  viewColis(colis: Colis): void {
    this.router.navigate(['/colis', colis.idColis]);
  }
  
  openStatusDialog(colis: Colis): void {
    this.selectedColis = colis;
    this.statusForm.patchValue({
      statutId: colis.statuts.idStatut
    });
    
    const dialogRef = this.dialog.open(this.statusDialog);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedColis) {
        this.updateColisStatus(this.selectedColis, this.statusForm.get('statutId')?.value);
      }
    });
  }
  
  updateColisStatus(colis: Colis, statutId: number): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    
    this.adminService.updateColisStatus(colis.idColis, statutId, parseInt(this.currentUser.idUser))
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (updatedColis) => {
          // Mettre à jour le colis dans la liste
          const index = this.dataSource.data.findIndex(c => c.idColis === colis.idColis);
          if (index !== -1) {
            this.dataSource.data[index] = updatedColis;
            this.dataSource._updateChangeSubscription();
          }
          
          this.snackBar.open('Statut du colis mis à jour avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  onPageChange(event: any): void {
    // Si besoin de recharger les données en fonction de la pagination
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
