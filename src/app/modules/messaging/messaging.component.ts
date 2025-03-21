// src/app/modules/messaging/messaging.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ColisService } from '../../core/services/colis.service';
import { PriseEnChargeService } from '../../core/services/prise-en-charge.service';
import { User } from '../../core/models/user.model';
import { Colis } from '../../core/models/colis.model';
import { PriseEnCharge } from '../../core/models/prise-en-charge.model';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface ChatRoom {
  id: number;
  name: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
  users: {
    id: string;
    name: string;
  }[];
  relatedColis?: Colis;
  relatedTrajet?: PriseEnCharge;
}

interface ChatMessage {
  id?: number;
  idPrise: number;
  idUserPrise: string;
  idUserColis: string;
  sender: string;
  horodatage: Date;
  message: string;
  isRead: boolean;
  notificationSent: boolean;
}

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;
  
  currentUser: User | null = null;
  
  // État de l'interface
  loading = true;
  loadingMessages = false;
  selectedRoomId: number | null = null;
  
  // Données
  chatRooms: ChatRoom[] = [];
  messages: ChatMessage[] = [];
  
  // Formulaire
  messageForm: FormGroup;
  
  // Abonnements
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
    private colisService: ColisService,
    private priseEnChargeService: PriseEnChargeService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    if (this.currentUser) {
      // Initialiser la connexion WebSocket
      this.chatService.initializeWebSocketConnection(this.currentUser.idUser);
      
      // Charger les conversations actives
      this.loadActiveConversations();
      
      // Vérifier les paramètres de l'URL pour une conversation spécifique
      this.route.queryParams.subscribe(params => {
        if (params['userId']) {
          // Créer une nouvelle conversation ou ouvrir une existante
          this.openOrCreateConversation(params['userId'], params['colisId'], params['trajetId']);
        }
      });
      
      // S'abonner aux messages
      this.subscribeToMessages();
    }
  }
  
  ngOnDestroy(): void {
    // Se désabonner de tous les abonnements
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Fermer la connexion WebSocket
    this.chatService.disconnect();
  }
  
  ngAfterViewChecked(): void {
    // Faire défiler automatiquement vers le bas quand de nouveaux messages sont chargés
    this.scrollToBottom();
  }
  
  loadActiveConversations(): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    
    this.chatService.getActiveConversations(this.currentUser.idUser)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (roomIds) => {
          // Pour chaque salle, charger les détails
          roomIds.forEach(roomId => {
            this.loadRoomDetails(roomId);
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des conversations:', error);
        }
      });
  }
  
  loadRoomDetails(roomId: number): void {
    // Charger les détails de la prise en charge
    this.priseEnChargeService.getPriseEnChargeById(roomId)
      .subscribe({
        next: (priseEnCharge) => {
          // Créer une salle de chat
          const room: ChatRoom = {
            id: roomId,
            name: `${priseEnCharge.villeDepart} → ${priseEnCharge.villeArrivee}`,
            unreadCount: 0,
            users: [
              {
                id: priseEnCharge.users.idUser,
                name: `${priseEnCharge.users.prenom} ${priseEnCharge.users.nom}`
              }
            ],
            relatedTrajet: priseEnCharge
          };
          
          // Si la prise en charge a un colis associé
          if (priseEnCharge.colis) {
            room.relatedColis = priseEnCharge.colis;
            
            // Ajouter l'utilisateur du colis
            room.users.push({
              id: priseEnCharge.colis.users.idUser,
              name: `${priseEnCharge.colis.users.prenom} ${priseEnCharge.colis.users.nom}`
            });
          }
          
          // Charger le dernier message
          this.chatService.getMessageHistory(roomId)
            .subscribe({
              next: (messages) => {
                if (messages.length > 0) {
                  const lastMessage = messages[messages.length - 1];
                  room.lastMessage = lastMessage.message;
                  room.lastMessageDate = lastMessage.horodatage;
                  
                  // Compter les messages non lus
                  room.unreadCount = messages.filter(m => 
                    !m.isRead && 
                    m.sender !== this.currentUser?.idUser
                  ).length;
                }
                
                // Ajouter la salle au tableau
                this.chatRooms.push(room);
                
                // Trier les salles par date de dernier message
                this.sortRooms();
              }
            });
        }
      });
  }
  
  openOrCreateConversation(userId: string, colisId?: string, trajetId?: string): void {
    if (!this.currentUser) return;
    
    // Vérifier si une conversation existe déjà
    const existingRoom = this.chatRooms.find(room => 
      room.users.some(user => user.id === userId)
    );
    
    if (existingRoom) {
      // Ouvrir la conversation existante
      this.selectRoom(existingRoom.id);
    } else if (colisId) {
      // Créer une nouvelle conversation basée sur un colis
      this.colisService.getColisById(parseInt(colisId))
        .subscribe({
          next: (colis) => {
            // TODO: Créer une prise en charge et une conversation
            // Pour l'instant, on simule une nouvelle salle
            const newRoom: ChatRoom = {
              id: Date.now(), // Temporaire, devrait être l'ID de la prise en charge
              name: `${colis.villeDepart} → ${colis.villeArrivee}`,
              unreadCount: 0,
              users: [
                {
                  id: this.currentUser!.idUser,
                  name: `${this.currentUser!.prenom} ${this.currentUser!.nom}`
                },
                {
                  id: userId,
                  name: 'Autre utilisateur' // À remplacer par le nom réel
                }
              ],
              relatedColis: colis
            };
            
            this.chatRooms.push(newRoom);
            this.selectRoom(newRoom.id);
          }
        });
    } else if (trajetId) {
      // Créer une nouvelle conversation basée sur un trajet
      this.priseEnChargeService.getPriseEnChargeById(parseInt(trajetId))
        .subscribe({
          next: (trajet) => {
            // TODO: Créer une conversation
            // Pour l'instant, on simule une nouvelle salle
            const newRoom: ChatRoom = {
              id: parseInt(trajetId),
              name: `${trajet.villeDepart} → ${trajet.villeArrivee}`,
              unreadCount: 0,
              users: [
                {
                  id: this.currentUser!.idUser,
                  name: `${this.currentUser!.prenom} ${this.currentUser!.nom}`
                },
                {
                  id: userId,
                  name: 'Autre utilisateur' // À remplacer par le nom réel
                }
              ],
              relatedTrajet: trajet
            };
            
            this.chatRooms.push(newRoom);
            this.selectRoom(newRoom.id);
          }
        });
    }
  }
  
  selectRoom(roomId: number): void {
    this.selectedRoomId = roomId;
    this.loadingMessages = true;
    this.messages = [];
    
    // Charger l'historique des messages
    this.chatService.getMessageHistory(roomId)
      .pipe(finalize(() => {
        this.loadingMessages = false;
      }))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          
          // Marquer les messages comme lus
          this.markMessagesAsRead();
          
          // Mettre à jour le compteur de messages non lus
          const room = this.chatRooms.find(r => r.id === roomId);
          if (room) {
            room.unreadCount = 0;
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des messages:', error);
        }
      });
  }
  
  sendMessage(): void {
    if (!this.currentUser || !this.selectedRoomId || this.messageForm.invalid) return;
    
    const messageText = this.messageForm.get('message')?.value.trim();
    if (!messageText) return;
    
    // Trouver la salle sélectionnée
    const room = this.chatRooms.find(r => r.id === this.selectedRoomId);
    if (!room) return;
    
    // Créer un message
    const message: ChatMessage = {
      idPrise: this.selectedRoomId,
      idUserPrise: room.users.find(u => u.id !== this.currentUser?.idUser)?.id || '',
      idUserColis: this.currentUser.idUser,
      sender: this.currentUser.idUser,
      horodatage: new Date(),
      message: messageText,
      isRead: false,
      notificationSent: false
    };
    
    // Envoyer le message
    this.chatService.sendMessage(message)
      .subscribe({
        next: () => {
          // Réinitialiser le formulaire
          this.messageForm.reset();
          
          // Ajouter le message à la liste locale
          this.messages.push(message);
          
          // Mettre à jour le dernier message de la salle
          if (room) {
            room.lastMessage = messageText;
            room.lastMessageDate = new Date();
          }
          
          // Trier les salles
          this.sortRooms();
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi du message:', error);
        }
      });
  }
  
  markMessagesAsRead(): void {
    if (!this.currentUser || !this.selectedRoomId) return;
    
    // Parcourir les messages non lus
    this.messages.forEach(message => {
      if (!message.isRead && message.sender !== this.currentUser?.idUser) {
        this.chatService.markMessageAsRead(
          this.selectedRoomId!,
          message.horodatage,
          this.currentUser!.idUser
        ).subscribe();
        
        // Marquer le message comme lu localement
        message.isRead = true;
      }
    });
  }
  
  subscribeToMessages(): void {
    // TODO: Implémenter la réception des messages WebSocket
  }
  
  scrollToBottom(): void {
    try {
      this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
    } catch (err) {}
  }
  
  sortRooms(): void {
    // Trier les salles par date de dernier message (plus récent en premier)
    this.chatRooms.sort((a, b) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });
  }
  
  isOwnMessage(message: ChatMessage): boolean {
    return message.sender === this.currentUser?.idUser;
  }
  
  getOtherUser(room: ChatRoom): { id: string, name: string } | undefined {
    if (!this.currentUser) return undefined;
    return room.users.find(u => u.id !== this.currentUser?.idUser);
  }
  
  getFormattedDate(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Si c'est aujourd'hui, afficher seulement l'heure
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si c'est cette année, afficher le jour et le mois
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + 
        ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Sinon, afficher la date complète
    return messageDate.toLocaleDateString() + 
      ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
 * Récupère le nom de la salle de chat sélectionnée
 */
getSelectedRoomName(): string {
  if (!this.selectedRoomId) return '';
  
  const room = this.chatRooms.find(r => r.id === this.selectedRoomId);
  return room?.name || '';
}

/**
 * Récupère le nom de l'autre utilisateur dans la salle de chat sélectionnée
 */
getSelectedRoomOtherUserName(): string {
  if (!this.selectedRoomId) return '';
  
  const room = this.chatRooms.find(r => r.id === this.selectedRoomId);
  if (!room) return '';
  
  const otherUser = this.getOtherUser(room);
  return otherUser?.name || '';
}

}
