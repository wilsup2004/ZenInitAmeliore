// src/app/core/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Message } from '../models/message.model';
import { environment } from '../../../environments/environment';
import * as SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private stompClient: Client | null = null;

  constructor(private http: HttpClient) {}

  // Initialiser la connexion WebSocket
  initializeWebSocketConnection(userId: string): void {
    // Créer une nouvelle instance de Client
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      debug: function(str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000, // Tentative de reconnexion après 5 secondes
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Définir le callback de connexion
    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      
      // S'abonner au canal des messages pour chaque conversation active
      this.getActiveConversations(userId).subscribe(roomIds => {
        roomIds.forEach(roomId => {
          this.stompClient?.subscribe(`/topic/chat/${roomId}`, (message) => {
            // Traiter le message reçu
            const messageBody = JSON.parse(message.body);
            console.log('Message reçu:', messageBody);
          });
        });
      });

      // S'abonner au canal des notifications
      this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (notification) => {
        // Traiter la notification reçue
        const notificationBody = JSON.parse(notification.body);
        console.log('Notification reçue:', notificationBody);
      });
    };

    // Gérer les erreurs de connexion
    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Démarrer la connexion
    this.stompClient.activate();
  }

  // Fermer la connexion WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  // Envoyer un message
  sendMessage(message: Message): Observable<any> {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${message.idPrise}`,
        body: JSON.stringify(message)
      });
      return of({ success: true });
    } else {
      console.error('WebSocket non connecté');
      return of({ success: false, error: 'WebSocket non connecté' });
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