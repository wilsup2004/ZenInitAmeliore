// src/app/core/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.authService.isLoggedIn) {
      // Vérifier si l'utilisateur est un administrateur
      if (this.authService.isAdmin) {
        return this.authService.checkToken().pipe(
          map(isValid => {
            if (isValid) {
              return true;
            } else {
              this.handleAuthError();
              return false;
            }
          }),
          catchError(() => {
            this.handleAuthError();
            return of(false);
          })
        );
      } else {
        this.handleUnauthorizedError();
        return false;
      }
    } else {
      this.handleAuthError();
      return false;
    }
  }

  private handleAuthError(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  private handleUnauthorizedError(): void {
    this.router.navigate(['/unauthorized']);
  }
}