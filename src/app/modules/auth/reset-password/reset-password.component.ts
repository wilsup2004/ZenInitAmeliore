// src/app/modules/auth/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  token: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  ngOnInit(): void {
    // Récupérer le token depuis les paramètres de la route
    this.token = this.route.snapshot.queryParams['token'] || null;
    
    if (!this.token) {
      this.snackBar.open('Token de réinitialisation invalide ou expiré', 'Fermer', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/forgot-password']);
    }
  }
  
  // Faciliter l'accès aux contrôles du formulaire
  get f() {
    return this.resetPasswordForm.controls;
  }
  
  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    // Arrêter le traitement si le formulaire est invalide
    if (this.resetPasswordForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Simulation d'une requête de réinitialisation de mot de passe
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('Votre mot de passe a été réinitialisé avec succès', 'Fermer', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.router.navigate(['/auth/login']);
    }, 1500);
  }
}
