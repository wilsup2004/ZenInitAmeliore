// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/trade`;

  constructor(private http: HttpClient) {
    // Récupérer l'utilisateur depuis le localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Obtenir l'utilisateur courant
  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Vérifier si l'utilisateur est connecté
  public get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Vérifier si l'utilisateur est administrateur
  public get isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.usersProfils) return false;
    
    // Vérifier si l'utilisateur a un profil d'administrateur (idProfil = 1 pour admin)
    return user.usersProfils.some(profile => profile.profil?.idProfil === 1);
  }

  // Connexion
  login(email: string, password: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/auth?mail=${email}&password=${password}`)
      .pipe(
        tap(user => {
          // Stocker l'utilisateur dans le localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          throw new Error('Identifiants incorrects');
        })
      );
  }

  // Inscription
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  // Déconnexion
  logout(): void {
    // Supprimer l'utilisateur du localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Mettre à jour le profil
  updateProfile(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${user.idUser}`, user)
      .pipe(
        tap(() => {
          // Mettre à jour l'utilisateur dans le localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  // Vérifier si le token est valide
  checkToken(): Observable<boolean> {
    const user = this.currentUser;
    if (!user) {
      return of(false);
    }

    // Dans un vrai scénario, on ferait une requête au serveur pour valider le token
    // Ici, on simule juste la vérification
    return of(true);
  }
}
