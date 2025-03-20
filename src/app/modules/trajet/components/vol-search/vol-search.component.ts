// src/app/modules/trajet/components/vol-search/vol-search.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrajetService } from '../../../../core/services/trajet.service';
import { Aeroport } from '../../../../core/models/aeroport.model';
import { Vol } from '../../../../core/models/vol.model';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-vol-search',
  template: `
    <div class="vol-search-container">
      <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
        <div class="aeroport-selection">
          <mat-form-field appearance="outline">
            <mat-label>Aéroport de départ</mat-label>
            <input 
              matInput 
              formControlName="aeroportDepart" 
              [matAutocomplete]="autoDep" 
              placeholder="Ex: Aéroport Paris-Charles de Gaulle" 
              required>
            <mat-autocomplete #autoDep="matAutocomplete" [displayWith]="displayAeroport" (optionSelected)="onAeroportSelected('aeroportDepart', $event)">
              <mat-option *ngFor="let aeroport of filteredDepartureAirports | async" [value]="aeroport">
                {{ aeroport.aeroNom }} ({{ aeroport.idAero }}) - {{ aeroport.aeroVille }}
              </mat-option>
            </mat-autocomplete>
            <mat-error *ngIf="searchForm.get('aeroportDepart')?.hasError('required')">
              L'aéroport de départ est requis
            </mat-error>
          </mat-form-field>
          
          <mat-icon class="arrow-icon">arrow_forward</mat-icon>
          
          <mat-form-field appearance="outline">
            <mat-label>Aéroport d'arrivée</mat-label>
            <input 
              matInput 
              formControlName="aeroportArrivee" 
              [matAutocomplete]="autoArr" 
              placeholder="Ex: Aéroport de Lyon-Saint Exupéry" 
              required>
            <mat-autocomplete #autoArr="matAutocomplete" [displayWith]="displayAeroport" (optionSelected)="onAeroportSelected('aeroportArrivee', $event)">
              <mat-option *ngFor="let aeroport of filteredArrivalAirports | async" [value]="aeroport">
                {{ aeroport.aeroNom }} ({{ aeroport.idAero }}) - {{ aeroport.aeroVille }}
              </mat-option>
            </mat-autocomplete>
            <mat-error *ngIf="searchForm.get('aeroportArrivee')?.hasError('required')">
              L'aéroport d'arrivée est requis
            </mat-error>
          </mat-form-field>
        </div>
        
        <div class="search-action">
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="searchForm.invalid || searching">
            <mat-icon>search</mat-icon>
            Rechercher des vols
          </button>
        </div>
      </form>
      
      <!-- Results -->
      <div class="search-results" *ngIf="vols.length > 0">
        <h3>Vols disponibles</h3>
        
        <mat-table [dataSource]="vols" class="vols-table">
          <!-- Vol Column -->
          <ng-container matColumnDef="vol">
            <mat-header-cell *matHeaderCellDef>Vol</mat-header-cell>
            <mat-cell *matCellDef="let vol">
              {{ vol.airline?.name || 'N/A' }} {{ vol.flight?.iata || vol.numVol || 'N/A' }}
            </mat-cell>
          </ng-container>
          
          <!-- Départ Column -->
          <ng-container matColumnDef="depart">
            <mat-header-cell *matHeaderCellDef>Départ</mat-header-cell>
            <mat-cell *matCellDef="let vol">
              {{ vol.departure.scheduled | date:'dd/MM/yyyy HH:mm' }}
            </mat-cell>
          </ng-container>
          
          <!-- Arrivée Column -->
          <ng-container matColumnDef="arrivee">
            <mat-header-cell *matHeaderCellDef>Arrivée</mat-header-cell>
            <mat-cell *matCellDef="let vol">
              {{ vol.arrival.scheduled | date:'dd/MM/yyyy HH:mm' }}
            </mat-cell>
          </ng-container>
          
          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Statut</mat-header-cell>
            <mat-cell *matCellDef="let vol">
              {{ vol.flight_status || 'N/A' }}
            </mat-cell>
          </ng-container>
          
          <!-- Action Column -->
          <ng-container matColumnDef="action">
            <mat-header-cell *matHeaderCellDef>Action</mat-header-cell>
            <mat-cell *matCellDef="let vol">
              <button 
                mat-icon-button 
                color="primary" 
                (click)="selectVol(vol)" 
                [disabled]="selectedVol === vol"
                matTooltip="Sélectionner ce vol">
                <mat-icon>check_circle</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          
          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;" 
            [class.selected-row]="selectedVol === row">
          </mat-row>
        </mat-table>
      </div>
      
      <!-- Loading state -->
      <div class="loading-state" *ngIf="searching">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Recherche des vols en cours...</span>
      </div>
      
      <!-- No results -->
      <div class="no-results" *ngIf="!searching && searched && vols.length === 0">
        <mat-icon>flight_off</mat-icon>
        <p>Aucun vol trouvé pour ce trajet</p>
      </div>
    </div>
  `,
  styles: [`
    .vol-search-container {
      margin-bottom: 24px;
    }

    .aeroport-selection {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      .arrow-icon {
        color: var(--text-color-secondary);
      }
    }

    mat-form-field {
      flex: 1;
    }

    .search-action {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .search-results {
      margin-top: 24px;
      
      h3 {
        margin-bottom: 16px;
        font-size: 1.1rem;
        color: var(--text-color);
      }
    }

    .vols-table {
      width: 100%;
      
      .selected-row {
        background-color: var(--translucent-bg);
      }
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 16px 0;
      
      span {
        color: var(--text-color-secondary);
      }
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 0;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--text-color-secondary);
        opacity: 0.5;
        margin-bottom: 16px;
      }
      
      p {
        color: var(--text-color-secondary);
      }
    }

    @media (max-width: 768px) {
      .aeroport-selection {
        flex-direction: column;
        gap: 16px;
        
        .arrow-icon {
          margin: 8px 0;
          transform: rotate(90deg);
        }
      }
    }
  `]
})
export class VolSearchComponent implements OnInit {
  @Input() aeroports: Aeroport[] = [];
  @Output() volSelected = new EventEmitter<Vol>();
  @Output() search = new EventEmitter<{origin: string, destination: string}>();
  
  searchForm: FormGroup;
  vols: Vol[] = [];
  selectedVol: Vol | null = null;
  searching = false;
  searched = false;
  
  displayedColumns: string[] = ['vol', 'depart', 'arrivee', 'status', 'action'];
  
  filteredDepartureAirports: Observable<Aeroport[]> | undefined;
  filteredArrivalAirports: Observable<Aeroport[]> | undefined;
  
  constructor(
    private fb: FormBuilder,
    private trajetService: TrajetService
  ) {
    this.searchForm = this.fb.group({
      aeroportDepart: ['', Validators.required],
      aeroportArrivee: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.setupFilters();
  }
  
  private setupFilters(): void {
    // Configurer les filtres d'autocomplétion
    this.filteredDepartureAirports = this.searchForm.get('aeroportDepart')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.aeroNom;
        return name ? this._filterAeroports(name) : this.aeroports.slice();
      })
    );
    
    this.filteredArrivalAirports = this.searchForm.get('aeroportArrivee')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.aeroNom;
        return name ? this._filterAeroports(name) : this.aeroports.slice();
      })
    );
  }
  
  private _filterAeroports(value: string): Aeroport[] {
    const filterValue = value.toLowerCase();
    
    return this.aeroports.filter(aeroport => {
      const nameMatch = aeroport.aeroNom && aeroport.aeroNom.toLowerCase().includes(filterValue);
      const cityMatch = aeroport.aeroVille && aeroport.aeroVille.toLowerCase().includes(filterValue);
      const codeMatch = aeroport.idAero && aeroport.idAero.toLowerCase().includes(filterValue);
      return nameMatch || cityMatch || codeMatch;
    });
  }
  
  displayAeroport(aeroport: Aeroport): string {
    return aeroport && aeroport.aeroNom ? `${aeroport.aeroNom} (${aeroport.idAero})` : '';
  }
  
  onAeroportSelected(controlName: string, event: any): void {
    // Nothing to do here, just keep the selected aeroport
  }
  
  onSearch(): void {
    if (this.searchForm.invalid) return;
    
    const departureAeroport = this.searchForm.get('aeroportDepart')?.value;
    const arrivalAeroport = this.searchForm.get('aeroportArrivee')?.value;
    
    if (!departureAeroport || !arrivalAeroport) return;
    
    this.searching = true;
    this.vols = [];
    this.selectedVol = null;
    
    // Emit search event for parent component to handle
    this.search.emit({
      origin: departureAeroport.idAero,
      destination: arrivalAeroport.idAero
    });
    
    this.trajetService.searchFlights(departureAeroport.idAero, arrivalAeroport.idAero)
      .pipe(finalize(() => {
        this.searching = false;
        this.searched = true;
      }))
      .subscribe({
        next: (vols: Vol[]) => {
          this.vols = vols;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche de vols:', error);
        }
      });
  }
  
  selectVol(vol: Vol): void {
    this.selectedVol = vol;
    this.volSelected.emit(vol);
  }
}
