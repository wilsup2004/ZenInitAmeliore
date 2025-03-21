// src/app/modules/colis/colis.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ColisRoutingModule } from './colis-routing.module';
import { ColisListComponent } from './colis-list/colis-list.component';
import { ColisDetailComponent } from './colis-detail/colis-detail.component';
import { ColisCreateComponent } from './colis-create/colis-create.component';
import { ColisItemComponent } from './components/colis-item/colis-item.component';
import { ColisFilterComponent } from './components/colis-filter/colis-filter.component';
import { ColisSortComponent } from './components/colis-sort/colis-sort.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';

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
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    ColisListComponent,
    ColisDetailComponent,
    ColisCreateComponent,
    ColisItemComponent,
    ColisFilterComponent,
    ColisSortComponent,
    ImageUploadComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ColisRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatDividerModule,
    MatSliderModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSnackBarModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatMenuModule
  ]
})
export class ColisModule { }
