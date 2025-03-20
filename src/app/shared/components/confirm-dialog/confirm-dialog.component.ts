// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  input?: {
    type: string;
    label: string;
    value: any;
    min?: number;
    max?: number;
  };
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
      
      <!-- Input field if provided -->
      <mat-form-field *ngIf="data.input" class="input-field">
        <mat-label>{{ data.input.label }}</mat-label>
        <input 
          matInput
          [type]="data.input.type"
          [(ngModel)]="data.input.value"
          [min]="data.input.min"
          [max]="data.input.max">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">
        {{ data.cancelText }}
      </button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        {{ data.confirmText }}
      </button>
    </div>
  `,
  styles: [`
    .input-field {
      width: 100%;
      margin-top: 16px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
  
  onConfirm(): void {
    if (this.data.input) {
      this.dialogRef.close({ confirmed: true, input: this.data.input.value });
    } else {
      this.dialogRef.close(true);
    }
  }
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
