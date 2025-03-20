// src/app/core/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { environment } from '../../../environments/environment';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private stompClient: any;
  private socket: any;

  constructor(private http: HttpClient) {}

  // Initialiser la connexion WebSocket
  initializeWebSocketConnection(userId: string): void {
    this.socket = new SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = Stomp.over(this.socket);
    
    this.stompClient.connect({}, () => {
      // S'abonner au canal des messages pour chaque conversation active
      this.getActiveConversations(userId).subscribe(roomIds => {
        roomIds.forEach(roomId => {
          this.stompClient.subscribe(`/topic/chat/${roomId}`, (message: any) => {
            // Traiter le message reçu
            const messageBody = JSON.parse(message.body);
            console.log('Message reçu:', messageBody);
          });
        });
      });

      // S'abonner au canal des notifications
      this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (notification: any) => {
        // Traiter la notification reçue
        const notificationBody = JSON.parse(notification.body);
        console.log('Notification reçue:', notificationBody);
      });
    });
  }

  // Fermer la connexion WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  // Envoyer un message
  sendMessage(message: Message): Observable<any> {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(`/app/chat/${message.idPrise}`, {}, JSON.stringify(message));
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    } else {
      return new Observable(observer => {
        observer.error('WebSocket non connecté');
        observer.complete();
      });
    }
  }

  // Récupérer l'historique des messages
  getMessageHistory(roomId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/history/${roomId}`);
  }

  // Marquer un message comme lu
  markMessageAsRead(roomId: number, messageDate: Date, userId: string): Observable<any> {
    const params = new HttpParams()
      .set('messageDate', messageDate.toISOString())
      .set('userId', userId);
    
    return this.http.put(`${this.apiUrl}/read/${roomId}`, null, { params });
  }

  // Récupérer les messages non lus
  getUnreadMessages(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/unread/${userId}`);
  }

  // Compter les messages non lus
  countUnreadMessages(userId: string): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unread/count/${userId}`);
  }

  // Récupérer les conversations actives
  getActiveConversations(userId: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/active/${userId}`);
  }

  // Envoyer une notification directe
  sendDirectNotification(userId: string, message: Message): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify/${userId}`, message);
  }
}
  