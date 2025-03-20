// src/app/modules/trajet/trajet-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrajetListComponent } from './trajet-list/trajet-list.component';
import { TrajetCreateComponent } from './trajet-create/trajet-create.component';
import { TrajetDetailComponent } from './trajet-detail/trajet-detail.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TrajetListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    component: TrajetCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: TrajetDetailComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrajetRoutingModule { }
