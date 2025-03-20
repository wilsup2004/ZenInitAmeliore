// src/app/modules/layout/layout-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

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
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../user/user.module').then(m => m.UserModule)
      },
      {
        path: 'colis',
        loadChildren: () => import('../colis/colis.module').then(m => m.ColisModule)
      },
      {
        path: 'trajet',
        loadChildren: () => import('../trajet/trajet.module').then(m => m.TrajetModule)
      },
      {
        path: 'messaging',
        loadChildren: () => import('../messaging/messaging.module').then(m => m.MessagingModule)
      },
      {
        path: 'payment',
        loadChildren: () => import('../payment/payment.module').then(m => m.PaymentModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
