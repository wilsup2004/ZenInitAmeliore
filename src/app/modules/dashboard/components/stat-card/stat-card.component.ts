// src/app/modules/dashboard/components/stat-card/stat-card.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = '';
  @Input() color: string = 'primary'; // primary, accent, warn, info
  @Input() route: string = '';
  
  constructor(private router: Router) {}
  
  navigate(): void {
    if (this.route) {
      this.router.navigate([this.route]);
    }
  }
}
