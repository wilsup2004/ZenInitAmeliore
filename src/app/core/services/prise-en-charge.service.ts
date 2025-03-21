// src/app/core/services/prise-en-charge.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PriseEnCharge } from '../models/prise-en-charge.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PriseEnChargeService {
  private apiUrl = `${environment.apiUrl}/trade/priseEnCharge`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les prises en charge
  getAllPriseEnCharge(): Observable<PriseEnCharge[]> {
    return this.http.get<PriseEnCharge[]>(this.apiUrl);
  }

  // Récupérer une prise en charge par ID
  getPriseEnChargeById(id: number): Observable<PriseEnCharge> {
    return this.http.get<PriseEnCharge>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les prises en charge par utilisateur
  getPriseEnChargeByUser(user: any): Observable<PriseEnCharge[]> {
    return this.http.post<PriseEnCharge[]>(`${this.apiUrl}/user`, user);
  }

  // Récupérer une prise en charge par colis
  getPriseEnChargeByColis(colisId: number): Observable<PriseEnCharge> {
    return this.http.get<PriseEnCharge>(`${this.apiUrl}/colis/${colisId}`);
  }

  // Récupérer les prises en charge par utilisateur et statut
  getPriseEnChargeByUserAndStatut(userId: string, statutId?: number): Observable<PriseEnCharge[]> {
    let params = new HttpParams().set('userNom', userId);
    
    if (statutId) {
      params = params.set('statut', statutId.toString());
    }
    
    return this.http.get<PriseEnCharge[]>(`${this.apiUrl}/userstatut`, { params });
  }

  // Créer une prise en charge
  createPriseEnCharge(priseEnCharge: Partial<PriseEnCharge>): Observable<any> {
    return this.http.post(this.apiUrl, priseEnCharge);
  }

  // Mettre à jour une prise en charge
  updatePriseEnCharge(id: number, priseEnCharge: PriseEnCharge): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, priseEnCharge);
  }

  // Annuler une prise en charge
  annulerPriseEnCharge(id: number, priseEnCharge: PriseEnCharge): Observable<any> {
    return this.http.put(`${this.apiUrl}/annule/${id}`, priseEnCharge);
  }
}