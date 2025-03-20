// src/app/modules/trajet/trajet-create/trajet-create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrajetService } from '../../../core/services/trajet.service';
import { PriseEnChargeService } from '../../../core/services/prise-en-charge.service';
import { AuthService } from '../../../core/services/auth.service';
import { Aeroport } from '../../../core/models/aeroport.model';
import { Vol } from '../../../core/models/vol.model';
import { User } from '../../../core/models/user.model';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-trajet-create',
  templateUrl: './trajet-create.component.html',
  styleUrls: ['./trajet-create.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class TrajetCreateComponent implements OnInit {
  trajetForm!: FormGroup;
  loading = false;
  currentUser: User | null = null;
  
  // Déclaration du trajet
  declarationType: 'manual' | 'vol' = 'manual';
  
  // Recherche d'aéroports
  aeroports: Aeroport[] = [];
  filteredDepartureAirports: Observable<Aeroport[]> | undefined;
  filteredArrivalAirports: Observable<Aeroport[]> | undefined;
  
  // Vols trouvés
  foundVols: Vol[] = [];
  selectedVol: Vol | null = null;
  searchingFlights = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private trajetService: TrajetService,
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Récupérer l'utilisateur actuel
    this.currentUser = this.authService.currentUser;
    
    // Initialiser le formulaire
    this.initForm();
    
    // Charger les aéroports
    this.loadAeroports();
  }
  
  private initForm(): void {
    this.trajetForm = this.fb.group({
      // Informations générales
      idVol: [''],
      
      // Départ
      aeroportDepart: ['', Validators.required],
      villeDepart: ['', Validators.required],
      dateDepart: ['', Validators.required],
      
      // Arrivée
      aeroportArrivee: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      dateArrivee: ['', Validators.required],
      
      // Capacité
      nbKilo: [5, [Validators.required, Validators.min(1), Validators.max(30)]]
    });
  }
  
  private loadAeroports(): void {
    this.trajetService.getAllAeroports().subscribe({
      next: (aeroports: Aeroport[]) => {
        this.aeroports = aeroports;
        
        // Configurer les filtres d'autocomplétion
        this.setupFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des aéroports:', error);
      }
    });
  }
  
  private setupFilters(): void {
    // Filtre pour les aéroports de départ
    this.filteredDepartureAirports = this.trajetForm.get('aeroportDepart')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.aeroNom;
        return name ? this._filterAeroports(name) : this.aeroports.slice();
      })
    );
    
    // Filtre pour les aéroports d'arrivée
    this.filteredArrivalAirports = this.trajetForm.get('aeroportArrivee')!.valueChanges.pipe(
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
      return nameMatch || cityMatch;
    });
  }
  
  displayAeroport(aeroport: Aeroport): string {
    return aeroport && aeroport.aeroNom ? `${aeroport.aeroNom} (${aeroport.idAero})` : '';
  }
  
  onAeroportSelected(controlName: string, event: any): void {
    const aeroport = event.option.value as Aeroport;
    
    if (controlName === 'aeroportDepart') {
      this.trajetForm.get('villeDepart')?.setValue(aeroport.aeroVille);
    } else if (controlName === 'aeroportArrivee') {
      this.trajetForm.get('villeArrivee')?.setValue(aeroport.aeroVille);
    }
  }
  
  // Recherche de vols
  searchFlights(): void {
    const departureAeroport = this.trajetForm.get('aeroportDepart')?.value;
    const arrivalAeroport = this.trajetForm.get('aeroportArrivee')?.value;
    
    if (!departureAeroport || !arrivalAeroport) {
      this.snackBar.open('Veuillez sélectionner les aéroports de départ et d\'arrivée', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }
    
    this.searchingFlights = true;
    
    this.trajetService.searchFlights(departureAeroport.idAero, arrivalAeroport.idAero)
      .pipe(finalize(() => {
        this.searchingFlights = false;
      }))
      .subscribe({
        next: (vols: Vol[]) => {
          this.foundVols = vols;
          
          if (vols.length === 0) {
            this.snackBar.open('Aucun vol trouvé pour ce trajet', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la recherche de vols:', error);
          this.snackBar.open('Erreur lors de la recherche de vols', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  // Sélection d'un vol
  selectVol(vol: Vol): void {
    this.selectedVol = vol;
    
    // Remplir les informations du formulaire
    this.trajetForm.patchValue({
      idVol: vol.numVol || vol.flight?.iata || '',
      dateDepart: new Date(vol.departure.scheduled),
      dateArrivee: new Date(vol.arrival.scheduled)
    });
  }
  
  // Soumettre le formulaire
  onSubmit(): void {
    if (this.trajetForm.invalid) {
      return;
    }
    
    if (!this.currentUser) {
      this.snackBar.open('Vous devez être connecté pour déclarer un trajet', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }
    
    this.loading = true;
    
    // Créer l'objet trajet (UsersDispo dans le backend)
    const trajet = {
      users: this.currentUser,
      idVol: this.trajetForm.get('idVol')?.value,
      villeDepart: this.trajetForm.get('villeDepart')?.value,
      dateDepart: this.trajetForm.get('dateDepart')?.value,
      villeArrivee: this.trajetForm.get('villeArrivee')?.value,
      dateArrivee: this.trajetForm.get('dateArrivee')?.value,
      nbKiloDispo: this.trajetForm.get('nbKilo')?.value,
      statuts: {
        idStatut: 1, // Créé
        libelStatut: 'CREE'
      }
    };
    
    // Envoyer la requête
    this.priseEnChargeService.createPriseEnCharge(trajet)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open('Trajet déclaré avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/trajet']);
        },
        error: (error) => {
          console.error('Erreur lors de la déclaration du trajet:', error);
          this.snackBar.open('Erreur lors de la déclaration du trajet', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
