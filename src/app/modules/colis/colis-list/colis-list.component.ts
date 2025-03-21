// src/app/modules/colis/colis-list/colis-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ColisService } from '../../../core/services/colis.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Colis } from '../../../core/models/colis.model';
import { User } from '../../../core/models/user.model';

interface ColisFilter {
  statut: number | null;
  villeDepart: string | null;
  villeArrivee: string | null;
}

interface ColisSort {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-colis-list',
  templateUrl: './colis-list.component.html',
  styleUrls: ['./colis-list.component.scss']
})
export class ColisListComponent implements OnInit {
  colis: Colis[] = [];
  filteredColis: Colis[] = [];
  loading = true;
  currentUser: User | null = null;
  
  activeTab = 'mes-colis'; // mes-colis, mes-prises, disponibles
  
  filter: ColisFilter = {
    statut: null,
    villeDepart: null,
    villeArrivee: null
  };
  
  sort: ColisSort = {
    field: 'horodatage',
    direction: 'desc'
  };
  
  constructor(
    private colisService: ColisService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    if (this.currentUser) {
      this.loadColisByTab();
    } else {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.loadColisByTab();
        }
      });
    }
  }
  
  loadColisByTab(): void {
    this.loading = true;
    
    if (!this.currentUser) {
      this.loading = false;
      return;
    }
    
    switch (this.activeTab) {
      case 'mes-colis':
        this.loadUserColis();
        break;
      case 'mes-prises':
        this.loadUserPrises();
        break;
      case 'disponibles':
        this.loadAvailableColis();
        break;
    }
  }
  
  loadUserColis(): void {
    if (!this.currentUser) return;
    
    this.colisService.getColisByUserAndStatut(this.currentUser.idUser, this.filter.statut || undefined)
      .subscribe({
        next: (data) => {
          this.colis = data;
          this.applyFiltersAndSort();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des colis:', error);
          this.snackBar.open('Erreur lors du chargement des colis', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }
  
  loadUserPrises(): void {
    if (!this.currentUser) return;
    
    // Cette méthode devrait être implémentée dans le service de prise en charge
    // Pour l'instant, utilisons un tableau vide
    this.colis = [];
    this.filteredColis = [];
    this.loading = false;
  }
  
  loadAvailableColis(): void {
    if (!this.currentUser) return;
    
    // Colis disponibles (statut = 1)
    this.colisService.getColisByTrajetAndStatut(
      this.filter.villeDepart || '',
      this.filter.villeArrivee || '',
      1,
      this.currentUser.idUser
    ).subscribe({
      next: (data) => {
        this.colis = data;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des colis disponibles:', error);
        this.snackBar.open('Erreur lors du chargement des colis disponibles', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }
  
  applyFilter(filter: ColisFilter): void {
    this.filter = filter;
    this.loadColisByTab();
  }
  
  applySort(sort: ColisSort): void {
    this.sort = sort;
    this.applyFiltersAndSort();
  }
  
  applyFiltersAndSort(): void {
    // Filtrer les colis
    this.filteredColis = this.colis.filter(c => {
      // Filtrer par statut
      if (this.filter.statut && c.statuts.idStatut !== this.filter.statut) {
        return false;
      }
      
      // Filtrer par ville de départ
      if (this.filter.villeDepart && !c.villeDepart.toLowerCase().includes(this.filter.villeDepart.toLowerCase())) {
        return false;
      }
      
      // Filtrer par ville d'arrivée
      if (this.filter.villeArrivee && !c.villeArrivee.toLowerCase().includes(this.filter.villeArrivee.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Trier les colis
    this.filteredColis.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (this.sort.field) {
        case 'horodatage':
          valueA = new Date(a.horodatage).getTime();
          valueB = new Date(b.horodatage).getTime();
          break;
        case 'nbKilo':
          valueA = a.nbKilo;
          valueB = b.nbKilo;
          break;
        case 'tarif':
          valueA = a.tarif;
          valueB = b.tarif;
          break;
        case 'villeDepart':
          valueA = a.villeDepart;
          valueB = b.villeDepart;
          break;
        case 'villeArrivee':
          valueA = a.villeArrivee;
          valueB = b.villeArrivee;
          break;
        default:
          // Accès sécurisé pour les propriétés dynamiques
          valueA = this.getPropertySafely(a, this.sort.field);
          valueB = this.getPropertySafely(b, this.sort.field);
      }
      
      if (this.sort.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }
  
  /**
   * Récupère une propriété d'un objet de manière sécurisée
   * @param obj L'objet sur lequel récupérer la propriété
   * @param propertyPath Le chemin de la propriété (ex: "user.name")
   * @returns La valeur de la propriété ou undefined si elle n'existe pas
   */
  getPropertySafely(obj: any, propertyPath: string): any {
    // Gestion des propriétés imbriquées (format "user.name")
    const props = propertyPath.split('.');
    let result = obj;
    
    for (const prop of props) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = result[prop];
    }
    
    return result;
  }
  
  changeTab(tab: string): void {
    this.activeTab = tab;
    this.loadColisByTab();
  }
}