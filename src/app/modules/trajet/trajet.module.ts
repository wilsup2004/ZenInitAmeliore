// src/app/modules/trajet/trajet.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { TrajetRoutingModule } from './trajet-routing.module';
import { TrajetListComponent } from './trajet-list/trajet-list.component';
import { TrajetCreateComponent } from './trajet-create/trajet-create.component';
import { TrajetDetailComponent } from './trajet-detail/trajet-detail.component';
import { TrajetFilterComponent } from './components/trajet-filter/trajet-filter.component';
import { TrajetSortComponent } from './components/trajet-sort/trajet-sort.component';
import { TrajetItemComponent } from './components/trajet-item/trajet-item.component';
import { VolSearchComponent } from './components/vol-search/vol-search.component';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '../../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    TrajetListComponent,
    TrajetCreateComponent,
    TrajetDetailComponent,
    TrajetFilterComponent,
    TrajetSortComponent,
    TrajetItemComponent,
    VolSearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TrajetRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatDividerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatRadioModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggleModule,
    SharedModule,
    MatCheckboxModule
  ]
})
export class TrajetModule { }