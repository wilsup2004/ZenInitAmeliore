// src/app/modules/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  stats: any = {};
  
  // Données pour les graphiques
  userStats: any[] = [];
  colisStats: any[] = [];
  paymentStats: any[] = [];
  
  // Activités récentes
  recentActivities: any[] = [];
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadDashboardStats();
  }
  
  loadDashboardStats(): void {
    this.loading = true;
    
    this.adminService.getDashboardStats()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (data) => {
          this.stats = data;
          
          // Préparer les données pour les graphiques
          this.prepareChartData();
          
          // Récupérer les activités récentes
          this.loadRecentActivities();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des statistiques du tableau de bord:', error);
        }
      });
  }
  
  loadRecentActivities(): void {
    this.adminService.getAdminLogs(0, 10)
      .subscribe({
        next: (data) => {
          this.recentActivities = data.content || [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement des activités récentes:', error);
        }
      });
  }
  
  prepareChartData(): void {
    // Préparer les données pour le graphique d'utilisateurs
    if (this.stats.usersByMonth) {
      this.userStats = Object.entries(this.stats.usersByMonth).map(([month, count]) => ({
        name: month,
        value: count
      }));
    }
    
    // Préparer les données pour le graphique de colis
    if (this.stats.colisByStatus) {
      this.colisStats = Object.entries(this.stats.colisByStatus).map(([status, count]) => ({
        name: this.getStatusLabel(status),
        value: count
      }));
    }
    
    // Préparer les données pour le graphique de paiements
    if (this.stats.paymentsByMonth) {
      this.paymentStats = Object.entries(this.stats.paymentsByMonth).map(([month, amount]) => ({
        name: month,
        value: amount
      }));
    }
  }
  
  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      '1': 'Créé',
      '2': 'En cours',
      '3': 'Clôturé',
      '4': 'En attente',
      '5': 'Accepté',
      '6': 'Refusé',
      '7': 'Annulé',
      '8': 'Livré'
    };
    
    return statusMap[status] || status;
  }

  /**
 * Retourne l'icône correspondant au type d'action
 * @param actionType Le type d'action
 * @returns Le nom de l'icône Material à afficher
 */
getActivityIcon(actionType: string): string {
  // Mapper les types d'actions aux icônes Material
  const iconMap: {[key: string]: string} = {
    'CREATE': 'add_circle',
    'UPDATE': 'edit',
    'DELETE': 'delete',
    'LOGIN': 'login',
    'LOGOUT': 'logout',
    'PAYMENT': 'payments',
    'ADMIN': 'admin_panel_settings',
    'USER': 'person',
    'COLIS': 'inventory_2',
    'TRAJET': 'flight',
    'MESSAGE': 'message'
  };
  
  // Retourner l'icône correspondante ou une icône par défaut si le type n'est pas reconnu
  return iconMap[actionType] || 'info';
}

}
