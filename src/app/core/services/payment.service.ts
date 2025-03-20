// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentMethod } from '../models/payment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  // Récupérer les méthodes de paiement disponibles
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`);
  }

  // Créer un paiement PayPal
  createPaypalPayment(payment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/create`, payment);
  }

  // Créer un paiement Stripe
  createStripePayment(payment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/stripe/create`, payment);
  }

  // Créer un paiement Orange Money
  createOrangeMoneyPayment(payment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orangemoney/create`, payment);
  }

  // Vérifier le statut d'un paiement
  getPaymentStatus(paymentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${paymentId}`);
  }

  // Mettre à jour le statut d'un paiement
  updatePaymentStatus(paymentId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/status/${paymentId}?status=${status}`, null);
  }

  // Récupérer les paiements d'un utilisateur
  getUserPayments(userId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Récupérer les statistiques de paiement
  getPaymentStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
}
