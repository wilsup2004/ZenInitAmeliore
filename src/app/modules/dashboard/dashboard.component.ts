// src/app/modules/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ColisService } from '../../core/services/colis.service';
import { TrajetService } from '../../core/services/trajet.service';
import { PriseEnChargeService } from '../../core/services/prise-en-charge.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin } from 'rxjs';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  currentUser: User | null = null;
  
  // Statistiques
  statCards = [
    { title: 'Mes colis', value: 0, icon: 'inventory_2', color: 'primary', route: '/colis' },
    { title: 'Mes prises en charge', value: 0, icon: 'check_circle', color: 'accent', route: '/colis' },
    { title: 'Colis en attente', value: 0, icon: 'hourglass_empty', color: 'warn', route: '/colis' },
    { title: 'Trajets déclarés', value: 0, icon: 'flight', color: 'info', route: '/trajet' }
  ];
  
  // Colis récents
  recentColis: any[] = [];
  
  // Trajets récents
  recentTrajets: any[] = [];
  
  // Activités récentes
  activities: any[] = [];
  
  constructor(
    private colisService: ColisService,
    private trajetService: TrajetService,
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    if (this.currentUser) {
      this.loadDashboardData(this.currentUser.idUser);
    } else {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.loadDashboardData(user.idUser);
        }
      });
    }
  }
  
  loadDashboardData(userId: string): void {
    this.loading = true;
    
    // Récupérer les données du tableau de bord
    forkJoin({
      colis: this.colisService.getColisByUserAndStatut(userId),
      prisesEnCharge: this.priseEnChargeService.getPriseEnChargeByUserAndStatut(userId)
    }).subscribe({
      next: (data) => {
        // Mettre à jour les statistiques
        this.updateStats(data.colis, data.prisesEnCharge);
        
        // Récupérer les colis récents
        this.recentColis = data.colis.slice(0, 5);
        
        // Récupérer les trajets récents (simulé pour l'instant)
        this.recentTrajets = data.prisesEnCharge.slice(0, 5);
        
        // Générer des activités récentes (simulé pour l'instant)
        this.generateActivities(data.colis, data.prisesEnCharge);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du tableau de bord', error);
        this.loading = false;
      }
    });
  }
  
  updateStats(colis: any[], prisesEnCharge: any[]): void {
    // Mettre à jour les statistiques
    this.statCards[0].value = colis.length;
    this.statCards[1].value = prisesEnCharge.length;
    
    // Colis en attente (statut = 1)
    this.statCards[2].value = colis.filter(c => c.statuts.idStatut === 1).length;
    
    // Trajets déclarés (simulé pour l'instant)
    this.statCards[3].value = prisesEnCharge.length;
  }
  
  generateActivities(colis: any[], prisesEnCharge: any[]): void {
    this.activities = [];
    
    // Ajouter les activités des colis
    colis.slice(0, 3).forEach(c => {
      this.activities.push({
        type: 'colis',
        title: `Colis #${c.idColis}`,
        description: `De ${c.villeDepart} à ${c.villeArrivee}`,
        status: c.statuts.libelStatut,
        date: c.horodatage,
        icon: 'inventory_2'
      });
    });
    
    // Ajouter les activités des prises en charge
    prisesEnCharge.slice(0, 3).forEach(p => {
      this.activities.push({
        type: 'prise',
        title: `Prise en charge #${p.idPrise}`,
        description: `De ${p.villeDepart} à ${p.villeArrivee}`,
        status: p.statuts.libelStatut,
        date: p.dateDepart,
        icon: 'check_circle'
      });
    });
    
    // Trier les activités par date (les plus récentes en premier)
    this.activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
