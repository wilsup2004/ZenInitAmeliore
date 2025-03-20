// src/app/modules/auth/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  // Faciliter l'accès aux contrôles du formulaire
  get f() {
    return this.forgotPasswordForm.controls;
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    // Arrêter le traitement si le formulaire est invalide
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Simulation d'une requête d'envoi d'email
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('Un email de réinitialisation a été envoyé à votre adresse email si elle existe dans notre système.', 'Fermer', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.router.navigate(['/auth/login']);
    }, 1500);
  }
}