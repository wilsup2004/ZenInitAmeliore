// src/app/modules/layout/components/sidenav/sidenav.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() unreadMessagesCount = 0;
  
  navigationItems: NavigationItem[] = [];
  isAdmin = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est un administrateur
    this.isAdmin = this.authService.isAdmin;
    
    // Configurer les éléments de navigation
    this.setNavigationItems();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = this.authService.isAdmin;
      this.setNavigationItems();
    });
  }

  setNavigationItems(): void {
    // Éléments de navigation pour tous les utilisateurs
    this.navigationItems = [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        route: '/dashboard'
      },
      {
        label: 'Mes colis',
        icon: 'inventory_2',
        route: '/colis'
      },
      {
        label: 'Trajets',
        icon: 'flight',
        route: '/trajet'
      },
      {
        label: 'Messagerie',
        icon: 'mail',
        route: '/messaging',
        badge: this.unreadMessagesCount
      },
      {
        label: 'Paiements',
        icon: 'payments',
        route: '/payment'
      },
      {
        label: 'Profil',
        icon: 'account_circle',
        route: '/profile'
      }
    ];

    // Ajouter l'élément administration si l'utilisateur est un administrateur
    if (this.isAdmin) {
      this.navigationItems.push({
        label: 'Administration',
        icon: 'admin_panel_settings',
        route: '/admin'
      });
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
