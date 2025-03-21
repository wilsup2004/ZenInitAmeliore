// src/app/modules/admin/user-management/user-management.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { AdminUser } from '../../../core/models/admin.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = true;
  users: User[] = [];
  admins: AdminUser[] = [];
  currentUser: User | null = null;
  
  // Table data
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();
  adminDataSource: MatTableDataSource<AdminUser> = new MatTableDataSource<AdminUser>();
  
  displayedColumns: string[] = ['idUser', 'nom', 'prenom', 'mail', 'actions'];
  adminDisplayedColumns: string[] = ['idUser', 'nom', 'prenom', 'adminLevel', 'creationDate', 'lastLogin', 'actions'];
  
  // Admin form
  showAdminForm = false;
  adminForm: FormGroup;
  processingAdmin = false;
  
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.adminForm = this.fb.group({
      userId: ['', Validators.required],
      adminLevel: [2, [Validators.required, Validators.min(1), Validators.max(3)]]
    });
  }
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadUsers();
    this.loadAdmins();
  }
  
  loadUsers(): void {
    this.loading = true;
    
    this.adminService.getAllUsers()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.dataSource.data = users;
          
          // Configuration de la pagination et du tri
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadAdmins(): void {
    this.adminService.getAllAdmins()
      .subscribe({
        next: (admins) => {
          this.admins = admins;
          this.adminDataSource.data = admins;
          
          // Configuration de la pagination et du tri
          setTimeout(() => {
            if (this.adminDataSource.data.length > 0) {
              this.adminDataSource.paginator = this.paginator;
              this.adminDataSource.sort = this.sort;
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des administrateurs:', error);
          this.snackBar.open('Erreur lors du chargement des administrateurs', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  applyAdminFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.adminDataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.adminDataSource.paginator) {
      this.adminDataSource.paginator.firstPage();
    }
  }
  
  toggleUserStatus(user: User): void {
    if (!this.currentUser) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: `Êtes-vous sûr de vouloir ${user.isActive ? 'désactiver' : 'activer'} cet utilisateur ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        if (user.isActive) {
          this.adminService.disableUser(user.idUser, this.currentUser!.idUser)
            .pipe(finalize(() => {
              this.loading = false;
            }))
            .subscribe({
              next: () => {
                user.isActive = false;
                this.snackBar.open('Utilisateur désactivé avec succès', 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
              },
              error: (error) => {
                console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
                this.snackBar.open('Erreur lors de la désactivation de l\'utilisateur', 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['error-snackbar']
                });
              }
            });
        } else {
          this.adminService.enableUser(user.idUser, this.currentUser!.idUser)
            .pipe(finalize(() => {
              this.loading = false;
            }))
            .subscribe({
              next: () => {
                user.isActive = true;
                this.snackBar.open('Utilisateur activé avec succès', 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
              },
              error: (error) => {
                console.error('Erreur lors de l\'activation de l\'utilisateur:', error);
                this.snackBar.open('Erreur lors de l\'activation de l\'utilisateur', 'Fermer', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      }
    });
  }
  
  promoteToAdmin(user: User): void {
    this.adminForm.patchValue({
      userId: user.idUser,
      adminLevel: 2
    });
    
    this.showAdminForm = true;
  }
  
  createAdmin(): void {
    if (!this.currentUser || this.adminForm.invalid) return;
    
    this.processingAdmin = true;
    
    const adminUserView = {
      userId: this.adminForm.get('userId')?.value,
      adminLevel: this.adminForm.get('adminLevel')?.value,
      adminId: this.currentUser.idUser
    };
    
    this.adminService.createAdmin(adminUserView)
      .pipe(finalize(() => {
        this.processingAdmin = false;
        this.showAdminForm = false;
      }))
      .subscribe({
        next: (admin) => {
          this.snackBar.open('Administrateur créé avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          
          // Recharger les listes
          this.loadAdmins();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'administrateur:', error);
          this.snackBar.open('Erreur lors de la création de l\'administrateur', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  updateAdminLevel(admin: AdminUser): void {
    if (!this.currentUser) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier le niveau d\'administrateur',
        message: `Définir le niveau d'administrateur pour ${admin.user.prenom} ${admin.user.nom}`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        input: {
          type: 'number',
          label: 'Niveau',
          value: admin.adminLevel,
          min: 1,
          max: 3
        }
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.input) {
        this.loading = true;
        
        this.adminService.updateAdminLevel(admin.idAdmin, result.input, this.currentUser!.idUser)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe({
            next: (updatedAdmin) => {
              admin.adminLevel = updatedAdmin.adminLevel;
              this.snackBar.open('Niveau d\'administrateur mis à jour avec succès', 'Fermer', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour du niveau d\'administrateur:', error);
              this.snackBar.open('Erreur lors de la mise à jour du niveau d\'administrateur', 'Fermer', {
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
  
  removeAdmin(admin: AdminUser): void {
    if (!this.currentUser) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: `Êtes-vous sûr de vouloir supprimer les droits d'administrateur de ${admin.user.prenom} ${admin.user.nom} ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        this.adminService.removeAdmin(admin.idAdmin, this.currentUser!.idUser)
          .pipe(finalize(() => {
            this.loading = false;
          }))
          .subscribe({
            next: () => {
              this.snackBar.open('Administrateur supprimé avec succès', 'Fermer', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
              
              // Recharger les listes
              this.loadAdmins();
              this.loadUsers();
            },
            error: (error) => {
              console.error('Erreur lors de la suppression de l\'administrateur:', error);
              this.snackBar.open('Erreur lors de la suppression de l\'administrateur', 'Fermer', {
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
  
  cancelAdminForm(): void {
    this.showAdminForm = false;
    this.adminForm.reset({
      adminLevel: 2
    });
  }


  /**
 * Vérifie si un utilisateur n'est pas déjà administrateur
 */
isNotAdmin(user: User): boolean {
  return !this.admins.some(admin => admin.user.idUser === user.idUser);
}

/**
 * Vérifie si l'administrateur est l'utilisateur courant
 */
isCurrentUser(admin: AdminUser): boolean {
  return admin.user.idUser === this.currentUser?.idUser;
}

/**
 * Vérifie si le champ adminLevel a une erreur de type required
 */
hasAdminLevelRequiredError(): boolean {
  return this.adminForm.get('adminLevel')?.hasError('required') || false;
}

/**
 * Vérifie si le champ adminLevel a une erreur de type min ou max
 */
hasAdminLevelRangeError(): boolean {
  const adminLevelControl = this.adminForm.get('adminLevel');
  return (adminLevelControl?.hasError('min') || adminLevelControl?.hasError('max')) || false;
}

}
