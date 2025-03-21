// src/app/core/services/trajet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vol } from '../models/vol.model';
import { Aeroport } from '../models/aeroport.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrajetService {
  private apiUrl = `${environment.apiUrl}/trade`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les aéroports
  getAllAeroports(): Observable<Aeroport[]> {
    return this.http.get<Aeroport[]>(`${this.apiUrl}/aeroports`);
  }

  // Rechercher un aéroport par nom
  searchAeroport(nom: string): Observable<Aeroport[]> {
    return this.http.get<Aeroport[]>(`${this.apiUrl}/aeroports/search?aeroNom=${nom}`);
  }

  // Récupérer un aéroport par ID
  getAeroportById(id: string): Observable<Aeroport> {
    return this.http.get<Aeroport>(`${this.apiUrl}/aeroports/${id}`);
  }

  // Rechercher des vols
  searchFlights(idOrigine: string, idDestination: string): Observable<Vol[]> {
    return this.http.get<Vol[]>(`${this.apiUrl}/flight/search?idOrigine=${idOrigine}&idDestination=${idDestination}`);
  }

  // Récupérer un vol spécifique
  getFlightByDetails(idOrigine: string, idDestination: string, idVol: string, statut: string): Observable<Vol> {
    const params = new HttpParams()
      .set('idOrigine', idOrigine)
      .set('idDestination', idDestination)
      .set('idVol', idVol)
      .set('statut', statut);
    
    return this.http.get<Vol>(`${this.apiUrl}/flight/search/vol`, { params });
  }
}