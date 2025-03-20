// src/app/modules/colis/components/colis-filter/colis-filter.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

// Interface pour le filtre
interface ColisFilter {
  statut: number | null;
  villeDepart: string | null;
  villeArrivee: string | null;
}

@Component({
  selector: 'app-colis-filter',
  templateUrl: './colis-filter.component.html',
  styleUrls: ['./colis-filter.component.scss']
})
export class ColisFilterComponent implements OnInit {
  @Input() filter!: ColisFilter;
  @Output() filterChange = new EventEmitter<ColisFilter>();
  
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
      villeArrivee: ['']
    });
  }
  
  ngOnInit(): void {
    // Initialiser le formulaire avec les valeurs du filtre
    this.filterForm.patchValue({
      statut: this.filter.statut,
      villeDepart: this.filter.villeDepart || '',
      villeArrivee: this.filter.villeArrivee || ''
    });
    
    // S'abonner aux changements du formulaire
    this.filterForm.valueChanges
      .pipe(debounceTime(300)) // Attendre 300ms après le dernier changement
      .subscribe(values => {
        const newFilter: ColisFilter = {
          statut: values.statut,
          villeDepart: values.villeDepart ? values.villeDepart.trim() : null,
          villeArrivee: values.villeArrivee ? values.villeArrivee.trim() : null
        };
        
        this.filterChange.emit(newFilter);
      });
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      statut: null,
      villeDepart: '',
      villeArrivee: ''
    });
  }
}
