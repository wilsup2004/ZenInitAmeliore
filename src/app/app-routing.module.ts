// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/layout/layout.module').then(m => m.LayoutModule),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('./modules/user/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'colis',
        loadChildren: () => import('./modules/colis/colis.module').then(m => m.ColisModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'trajet',
        loadChildren: () => import('./modules/trajet/trajet.module').then(m => m.TrajetModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'messaging',
        loadChildren: () => import('./modules/messaging/messaging.module').then(m => m.MessagingModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'payment',
        loadChildren: () => import('./modules/payment/payment.module').then(m => m.PaymentModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    scrollPositionRestoration: 'enabled', 
    relativeLinkResolution: 'legacy' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
