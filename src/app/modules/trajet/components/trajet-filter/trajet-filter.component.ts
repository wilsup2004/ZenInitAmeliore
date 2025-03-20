// src/app/modules/trajet/components/trajet-filter/trajet-filter.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// Interface pour le filtre
interface TrajetFilter {
  statut: number | null;
  villeDepart: string | null;
  villeArrivee: string | null;
  dateMin: Date | null;
  dateMax: Date | null;
}

@Component({
  selector: 'app-trajet-filter',
  templateUrl: './trajet-filter.component.html',
  styleUrls: ['./trajet-filter.component.scss']
})
export class TrajetFilterComponent implements OnInit {
  @Input() filter!: TrajetFilter;
  @Output() filterChange = new EventEmitter<TrajetFilter>();
  
  filterForm: FormGroup;
  
  // Liste des statuts pour le filtre
  statuts = [
    { id: null, libel: 'Tous les statuts' },
    { id: 1, libel: 'Créé' },
    { id: 2, libel: 'En cours' },
    { id: 3, libel: 'Clôturé' },
    { id: 4, libel: 'En attente' },
    { id: 5, libel: 'Accepté' },
    { id: 6, libel: 'Refusé' },
    { id: 7, libel: 'Annulé' },
    { id: 8, libel: 'Livré' }
  ];
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      statut: [null],
      villeDepart: [''],
      villeArrivee: [''],
      dateMin: [null],
      dateMax: [null]
    });
  }
  
  ngOnInit(): void {
    // Initialiser le formulaire avec les valeurs du filtre
    this.filterForm.patchValue({
      statut: this.filter.statut,
      villeDepart: this.filter.villeDepart || '',
      villeArrivee: this.filter.villeArrivee || '',
      dateMin: this.filter.dateMin,
      dateMax: this.filter.dateMax
    });
    
    // S'abonner aux changements du formulaire
    this.filterForm.valueChanges
      .pipe(debounceTime(300)) // Attendre 300ms après le dernier changement
      .subscribe(values => {
        const newFilter: TrajetFilter = {
          statut: values.statut,
          villeDepart: values.villeDepart ? values.villeDepart.trim() : null,
          villeArrivee: values.villeArrivee ? values.villeArrivee.trim() : null,
          dateMin: values.dateMin,
          dateMax: values.dateMax
        };
        
        this.filterChange.emit(newFilter);
      });
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      statut: null,
      villeDepart: '',
      villeArrivee: '',
      dateMin: null,
      dateMax: null
    });
  }
}
