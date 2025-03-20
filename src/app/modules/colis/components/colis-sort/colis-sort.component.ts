// src/app/modules/colis/components/colis-sort/colis-sort.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Interface pour le tri
interface ColisSort {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-colis-sort',
  templateUrl: './colis-sort.component.html',
  styleUrls: ['./colis-sort.component.scss']
})
export class ColisSortComponent implements OnInit {
  @Input() sort!: ColisSort;
  @Output() sortChange = new EventEmitter<ColisSort>();
  
  // Options de tri
  sortOptions = [
    { value: 'horodatage', label: 'Date de création' },
    { value: 'nbKilo', label: 'Poids' },
    { value: 'tarif', label: 'Prix' },
    { value: 'villeDepart', label: 'Ville de départ' },
    { value: 'villeArrivee', label: 'Ville d\'arrivée' }
  ];
  
  constructor() {}
  
  ngOnInit(): void {}
  
  onSortOptionChange(field: string): void {
    // Si on clique sur le même champ, on change la direction
    if (this.sort.field === field) {
      const newDirection = this.sort.direction === 'asc' ? 'desc' : 'asc';
      this.sort = { field, direction: newDirection };
    } else {
      // Sinon, on change le champ et on met la direction par défaut (desc)
      this.sort = { field, direction: 'desc' };
    }
    
    this.sortChange.emit(this.sort);
  }
  
  getSortLabel(): string {
    const option = this.sortOptions.find(o => o.value === this.sort.field);
    return option ? option.label : '';
  }
  
  getSortIcon(): string {
    return this.sort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}
