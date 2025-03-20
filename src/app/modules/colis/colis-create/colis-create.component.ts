// src/app/modules/colis/colis-create/colis-create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColisService } from '../../../core/services/colis.service';
import { TrajetService } from '../../../core/services/trajet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Aeroport } from '../../../core/models/aeroport.model';
import { Statut } from '../../../core/models/colis.model';
import { User } from '../../../core/models/user.model';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-colis-create',
  templateUrl: './colis-create.component.html',
  styleUrls: ['./colis-create.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class ColisCreateComponent implements OnInit {
  colisForm!: FormGroup;
  loading = false;
  currentUser: User | null = null;
  
  // Suggestions pour les villes
  filteredDepartureCities: Observable<string[]> | undefined;
  filteredArrivalCities: Observable<string[]> | undefined;
  villeOptions: string[] = [];
  
  // Image du colis
  selectedFile: File | null = null;
  
  // Statuts disponibles
  statuts: Statut[] = [
    { idStatut: 1, libelStatut: 'Créé' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private colisService: ColisService,
    private trajetService: TrajetService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Récupérer l'utilisateur actuel
    this.currentUser = this.authService.currentUser;
    
    // Initialiser le formulaire
    this.initForm();
    
    // Charger les aéroports pour les suggestions de villes
    this.loadAeroports();
    
    // Configurer les filtres d'autocomplétion
    this.setupFilters();
  }
  
  private initForm(): void {
    this.colisForm = this.fb.group({
      // Informations générales
      idStatut: [1, Validators.required], // Par défaut : 'Créé'
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      description: ['', Validators.required],
      
      // Dimensions et poids
      longueur: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      largeur: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      hauteur: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      nbKilo: ['', [Validators.required, Validators.min(0.1), Validators.max(30)]],
      
      // Prix proposé
      tarif: ['', [Validators.required, Validators.min(1)]]
    });
  }
  
  private loadAeroports(): void {
    this.trajetService.getAllAeroports().subscribe({
      next: (aeroports: Aeroport[]) => {
        // Extraire toutes les villes uniques
        const villeSet = new Set<string>();
        aeroports.forEach(aeroport => {
          if (aeroport.aeroVille) {
            villeSet.add(aeroport.aeroVille);
          }
        });
        
        this.villeOptions = Array.from(villeSet).sort();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des aéroports:', error);
      }
    });
  }
  
  private setupFilters(): void {
    // Configurer l'autocomplétion pour la ville de départ
    this.filteredDepartureCities = this.colisForm.get('villeDepart')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.villeOptions))
    );
    
    // Configurer l'autocomplétion pour la ville d'arrivée
    this.filteredArrivalCities = this.colisForm.get('villeArrivee')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.villeOptions))
    );
  }
  
  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
  
  // Gérer le fichier sélectionné
  onFileSelected(file: File | null): void {
    this.selectedFile = file;
  }
  
  // Soumettre le formulaire
  onSubmit(): void {
    if (this.colisForm.invalid) {
      return;
    }
    
    if (!this.currentUser) {
      this.snackBar.open('Vous devez être connecté pour créer un colis', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }
    
    this.loading = true;
    
    // Préparer les données du formulaire
    const formData = new FormData();
    
    // Ajouter les champs du formulaire
    formData.append('idStatut', this.colisForm.get('idStatut')!.value);
    formData.append('idUser', this.currentUser.idUser);
    formData.append('longueur', this.colisForm.get('longueur')!.value);
    formData.append('largeur', this.colisForm.get('largeur')!.value);
    formData.append('hauteur', this.colisForm.get('hauteur')!.value);
    formData.append('nbKilo', this.colisForm.get('nbKilo')!.value);
    formData.append('tarif', this.colisForm.get('tarif')!.value);
    formData.append('villeDepart', this.colisForm.get('villeDepart')!.value);
    formData.append('villeArrivee', this.colisForm.get('villeArrivee')!.value);
    formData.append('description', this.colisForm.get('description')!.value);
    
    // Ajouter le fichier s'il existe
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    } else {
      // Ajouter un fichier vide pour satisfaire le backend
      const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
      formData.append('file', emptyBlob, 'empty');
    }
    
    // Envoyer la requête
    this.colisService.createColis(formData)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open('Colis créé avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/colis']);
        },
        error: (error) => {
          console.error('Erreur lors de la création du colis:', error);
          this.snackBar.open('Erreur lors de la création du colis', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  // Calculer le volume du colis
  calculateVolume(): number {
    const longueur = this.colisForm.get('longueur')!.value || 0;
    const largeur = this.colisForm.get('largeur')!.value || 0;
    const hauteur = this.colisForm.get('hauteur')!.value || 0;
    
    return longueur * largeur * hauteur;
  }
}
