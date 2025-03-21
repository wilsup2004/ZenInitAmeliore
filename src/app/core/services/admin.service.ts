// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, AdminLog } from '../models/admin.model';
import { User, Colis, Payment, PaymentMethod } from '../models/';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques du dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Récupérer les statistiques détaillées
  getDetailedStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/detailed`);
  }

  // Récupérer tous les administrateurs
  getAllAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  // Récupérer un administrateur par ID
  getAdminById(adminId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${adminId}`);
  }

  // Créer un administrateur
  createAdmin(adminUserView: any): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/users`, adminUserView);
  }

  // Mettre à jour le niveau d'un administrateur
  updateAdminLevel(adminId: number, newLevel: number, adminActionId: string): Observable<AdminUser> {
    const params = new HttpParams()
      .set('newLevel', newLevel.toString())
      .set('adminActionId', adminActionId);
    
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${adminId}`, null, { params });
  }

  // Supprimer un administrateur
  removeAdmin(adminId: number, adminActionId: string): Observable<any> {
    const params = new HttpParams().set('adminActionId', adminActionId);
    
    return this.http.delete(`${this.apiUrl}/users/${adminId}`, { params });
  }

  // Mettre à jour la dernière connexion d'un administrateur
  updateLastLogin(adminId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${adminId}/login`, null);
  }

  // Enregistrer une action administrative
  logAdminAction(adminId: number, actionType: string, actionDetails: string): Observable<AdminLog> {
    const params = new HttpParams()
      .set('adminId', adminId.toString())
      .set('actionType', actionType)
      .set('actionDetails', actionDetails);
    
    return this.http.post<AdminLog>(`${this.apiUrl}/logs`, null, { params });
  }

  // Récupérer les logs administratifs paginés
  getAdminLogs(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get(`${this.apiUrl}/logs`, { params });
  }

  // Récupérer les logs d'un administrateur
  getAdminLogsByAdmin(adminId: number): Observable<AdminLog[]> {
    return this.http.get<AdminLog[]>(`${this.apiUrl}/logs/admin/${adminId}`);
  }

  // Récupérer les logs par type d'action
  getLogsByActionType(actionType: string): Observable<AdminLog[]> {
    return this.http.get<AdminLog[]>(`${this.apiUrl}/logs/type/${actionType}`);
  }

  // Récupérer les logs par plage de dates
  getLogsByDateRange(startDate: Date, endDate: Date): Observable<AdminLog[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get<AdminLog[]>(`${this.apiUrl}/logs/date`, { params });
  }

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/manage/users`);
  }

  // Désactiver un utilisateur
  disableUser(userId: string, adminId: string): Observable<any> {
    const params = new HttpParams().set('adminId', adminId);
    
    return this.http.put(`${this.apiUrl}/manage/users/${userId}/disable`, null, { params });
  }

  // Activer un utilisateur
  enableUser(userId: string, adminId: string): Observable<any> {
    const params = new HttpParams().set('adminId', adminId);
    
    return this.http.put(`${this.apiUrl}/manage/users/${userId}/enable`, null, { params });
  }

  // Récupérer tous les colis
  getAllColis(): Observable<Colis[]> {
    return this.http.get<Colis[]>(`${this.apiUrl}/manage/colis`);
  }

  // Mettre à jour le statut d'un colis
  updateColisStatus(colisId: number, statutId: number, adminId: number): Observable<Colis> {
    const params = new HttpParams()
      .set('statutId', statutId.toString())
      .set('adminId', adminId.toString());
    
    return this.http.put<Colis>(`${this.apiUrl}/manage/colis/${colisId}/status`, null, { params });
  }
/*
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment/`);
  }
*/
  // Récupérer tous les paiements
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/manage/payments`);
  }

  // Mettre à jour le statut d'un paiement
  updatePaymentStatus(paymentId: number, status: string, adminId: number): Observable<Payment> {
    const params = new HttpParams()
      .set('status', status)
      .set('adminId', adminId.toString());
    
    return this.http.put<Payment>(`${this.apiUrl}/manage/payments/${paymentId}/status`, null, { params });
  }
}
  