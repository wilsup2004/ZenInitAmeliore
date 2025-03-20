// src/app/modules/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ColisManagementComponent } from './colis-management/colis-management.component';
import { PaymentManagementComponent } from './payment-management/payment-management.component';
import { LogsComponent } from './logs/logs.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'colis',
    component: ColisManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'payments',
    component: PaymentManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
