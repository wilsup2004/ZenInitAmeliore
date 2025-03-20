// src/app/modules/layout/layout-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('../user/user.module').then(m => m.UserModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'colis',
        loadChildren: () => import('../colis/colis.module').then(m => m.ColisModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'trajet',
        loadChildren: () => import('../trajet/trajet.module').then(m => m.TrajetModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'messaging',
        loadChildren: () => import('../messaging/messaging.module').then(m => m.MessagingModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'payment',
        loadChildren: () => import('../payment/payment.module').then(m => m.PaymentModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
