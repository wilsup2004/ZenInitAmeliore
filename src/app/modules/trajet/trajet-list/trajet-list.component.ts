// src/app/modules/trajet/trajet-list/trajet-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { AuthService } from '../../../core/services/auth.service';
import { PriseEnCharge } from '../../../core/models/prise-en-charge.model';
import { User } from '../../../core/models/user.model';

interface TrajetFilter {
  statut: number | null;
  villeDepart: string | null;
  villeArrivee: string | null;
  dateMin: Date | null;
  dateMax: Date | null;
}

interface TrajetSort {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-trajet-list',
  templateUrl: './trajet-list.component.html',
  styleUrls: ['./trajet-list.component.scss']
})
export class TrajetListComponent implements OnInit {
  trajets: PriseEnCharge[] = [];
  filteredTrajets: PriseEnCharge[] = [];
  loading = true;
  currentUser: User | null = null;
  
  activeTab = 'mes-trajets'; // mes-trajets, disponibles
  
  filter: TrajetFilter = {
    statut: null,
    villeDepart: null,
    villeArrivee: null,
    dateMin: null,
    dateMax: null
  };
  
  sort: TrajetSort = {
    field: 'dateDepart',
    direction: 'asc'
  };
  
  constructor(
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    if (this.currentUser) {
      this.loadTrajetsByTab();
    } else {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.loadTrajetsByTab();
        }
      });
    }
  }
  
  loadTrajetsByTab(): void {
    this.loading = true;
    
    if (!this.currentUser) {
      this.loading = false;
      return;
    }
    
    switch (this.activeTab) {
      case 'mes-trajets':
        this.loadUserTrajets();
        break;
      case 'disponibles':
        this.loadAvailableTrajets();
        break;
    }
  }
  
  loadUserTrajets(): void {
    if (!this.currentUser) return;
    
    this.priseEnChargeService.getPriseEnChargeByUserAndStatut(this.currentUser.idUser, this.filter.statut || undefined)
      .subscribe({
        next: (data) => {
          this.trajets = data;
          this.applyFiltersAndSort();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des trajets:', error);
          this.snackBar.open('Erreur lors du chargement des trajets', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }
  
  loadAvailableTrajets(): void {
    // Pour charger tous les trajets disponibles (à adapter selon votre modèle de données)
    this.priseEnChargeService.getAllPriseEnCharge()
      .subscribe({
        next: (data) => {
          // Filtrer pour ne pas inclure les trajets de l'utilisateur actuel
          this.trajets = data.filter(t => this.currentUser && t.users.idUser !== this.currentUser.idUser);
          this.applyFiltersAndSort();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des trajets disponibles:', error);
          this.snackBar.open('Erreur lors du chargement des trajets disponibles', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }
  
  applyFilter(filter: TrajetFilter): void {
    this.filter = filter;
    this.applyFiltersAndSort();
  }
  
  applySort(sort: TrajetSort): void {
    this.sort = sort;
    this.applyFiltersAndSort();
  }
  
  applyFiltersAndSort(): void {
    // Filtrer les trajets
    this.filteredTrajets = this.trajets.filter(t => {
      // Filtrer par statut
      if (this.filter.statut && t.statuts.idStatut !== this.filter.statut) {
        return false;
      }
      
      // Filtrer par ville de départ
      if (this.filter.villeDepart && !t.villeDepart.toLowerCase().includes(this.filter.villeDepart.toLowerCase())) {
        return false;
      }
      
      // Filtrer par ville d'arrivée
      if (this.filter.villeArrivee && !t.villeArrivee.toLowerCase().includes(this.filter.villeArrivee.toLowerCase())) {
        return false;
      }
      
      // Filtrer par date de départ minimale
      if (this.filter.dateMin && new Date(t.dateDepart) < this.filter.dateMin) {
        return false;
      }
      
      // Filtrer par date de départ maximale
      if (this.filter.dateMax && new Date(t.dateDepart) > this.filter.dateMax) {
        return false;
      }
      
      return true;
    });
    
    // Trier les trajets
    this.filteredTrajets.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (this.sort.field) {
        case 'dateDepart':
          valueA = new Date(a.dateDepart).getTime();
          valueB = new Date(b.dateDepart).getTime();
          break;
        case 'dateArrivee':
          valueA = new Date(a.dateArrivee).getTime();
          valueB = new Date(b.dateArrivee).getTime();
          break;
        case 'villeDepart':
          valueA = a.villeDepart.toLowerCase();
          valueB = b.villeDepart.toLowerCase();
          break;
        case 'villeArrivee':
          valueA = a.villeArrivee.toLowerCase();
          valueB = b.villeArrivee.toLowerCase();
          break;
        default:
          valueA = a[this.sort.field as keyof PriseEnCharge];
          valueB = b[this.sort.field as keyof PriseEnCharge];
      }
      
      if (this.sort.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }
  
  changeTab(tab: string): void {
    this.activeTab = tab;
    this.loadTrajetsByTab();
  }
  
  viewTrajetDetails(trajetId: number): void {
    this.router.navigate(['/trajet', trajetId]);
  }
  
  createTrajet(): void {
    this.router.navigate(['/trajet/create']);
  }
}
