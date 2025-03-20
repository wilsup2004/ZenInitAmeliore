// src/app/modules/colis/colis-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColisListComponent } from './colis-list/colis-list.component';
import { ColisDetailComponent } from './colis-detail/colis-detail.component';
import { ColisCreateComponent } from './colis-create/colis-create.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ColisListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create',
    component: ColisCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: ColisDetailComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ColisRoutingModule { }
