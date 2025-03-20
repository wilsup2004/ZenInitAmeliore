// src/app/core/services/colis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Colis } from '../models/colis.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColisService {
  private apiUrl = `${environment.apiUrl}/trade/colis`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les colis
  getAllColis(): Observable<Colis[]> {
    return this.http.get<Colis[]>(this.apiUrl);
  }

  // Récupérer un colis par ID
  getColisById(id: number): Observable<Colis> {
    return this.http.get<Colis>(`${this.apiUrl}/${id}`);
  }

  // Récupérer l'image d'un colis
  getColisImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/image/${id}`, { responseType: 'blob' });
  }

  // Récupérer les colis par utilisateur et statut
  getColisByUserAndStatut(userId: string, statutId?: number): Observable<Colis[]> {
    let params = new HttpParams().set('userNom', userId);
    
    if (statutId) {
      params = params.set('statut', statutId.toString());
    }
    
    return this.http.get<Colis[]>(`${this.apiUrl}/userstatut`, { params });
  }

  // Récupérer les colis par trajet et statut
  getColisByTrajetAndStatut(origine: string, destination: string, statutId: number, userId?: string): Observable<Colis[]> {
    let params = new HttpParams()
      .set('origine', origine)
      .set('destination', destination)
      .set('statut', statutId.toString());
    
    if (userId) {
      params = params.set('idUser', userId);
    }
    
    return this.http.get<Colis[]>(`${this.apiUrl}/trajet`, { params });
  }

  // Créer un colis
  createColis(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // Mettre à jour un colis
  updateColis(formData: FormData): Observable<any> {
    return this.http.put(this.apiUrl, formData);
  }

  // Annuler une prise en charge
  annulerPriseEnCharge(colis: Colis): Observable<any> {
    return this.http.put(`${this.apiUrl}/annule`, colis);
  }
}