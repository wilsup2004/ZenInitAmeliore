// src/app/core/http/api.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from '../services/loading.service';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private loadingService: LoadingService,
    private translationService: TranslationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Incrémenter le compteur de requêtes en cours
    this.loadingService.show();

    // Ajouter les headers nécessaires
    const modifiedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs HTTP
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = this.translationService.translate('errors.client', { message: error.error.message });
        } else {
          // Erreur côté serveur
          switch (error.status) {
            case 401:
              errorMessage = this.translationService.translate('errors.unauthorized');
              break;
            case 403:
              errorMessage = this.translationService.translate('errors.forbidden');
              break;
            case 404:
              errorMessage = this.translationService.translate('errors.notFound');
              break;
            case 500:
              errorMessage = this.translationService.translate('errors.server');
              break;
            default:
              errorMessage = this.translationService.translate('errors.unknown', { message: error.error.message});
              break;
          }
        }

        // Afficher le message d'erreur
        this.snackBar.open(errorMessage, this.translationService.translate('common.close'), {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });

        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        // Décrémenter le compteur de requêtes en cours
        this.loadingService.hide();
      })
    );
  }
}
