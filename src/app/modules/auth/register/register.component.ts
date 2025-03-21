// src/app/modules/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // Rediriger vers la page d'accueil si déjà connecté
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
  }

  // Faciliter l'accès aux contrôles du formulaire
  get f() {
    return this.registerForm.controls;
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
    // Arrêter le traitement si le formulaire est invalide
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Créer l'objet utilisateur à partir du formulaire
    const user = {
      idUser: this.generateUserId(),
      nom: this.f['nom'].value,
      prenom: this.f['prenom'].value,
      mail: this.f['email'].value,
      password: this.f['password'].value,
      usersProfils: [{
        id: {
          idUser: '',
          idProfil: 2 // Profil utilisateur standard
        },
        profil: {
          idProfil: 2,
          libelProfil: 'User'
        },
        dateInit: new Date(),
        note: 0
      }],
      isActive:false
    };

    this.authService.register(user)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open('Inscription réussie, vous pouvez maintenant vous connecter', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.snackBar.open(this.errorMessage, 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Générer un ID utilisateur unique basé sur le prénom, le nom et un timestamp
  private generateUserId(): string {
    const timestamp = new Date().getTime().toString().slice(-4);
    const prefix = this.f['prenom'].value.slice(0, 1).toUpperCase() + this.f['nom'].value.slice(0, 1).toUpperCase();
    return prefix + timestamp;
  }
}
