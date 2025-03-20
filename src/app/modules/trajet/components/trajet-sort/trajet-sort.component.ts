// src/app/modules/trajet/components/trajet-sort/trajet-sort.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Interface pour le tri
interface TrajetSort {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-trajet-sort',
  templateUrl: './trajet-sort.component.html',
  styleUrls: ['./trajet-sort.component.scss']
})
export class TrajetSortComponent implements OnInit {
  @Input() sort!: TrajetSort;
  @Output() sortChange = new EventEmitter<TrajetSort>();
  
  // Options de tri
  sortOptions = [
    { value: 'dateDepart', label: 'Date de départ' },
    { value: 'dateArrivee', label: 'Date d\'arrivée' },
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
      // Sinon, on change le champ et on met la direction par défaut (asc)
      this.sort = { field, direction: 'asc' };
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
