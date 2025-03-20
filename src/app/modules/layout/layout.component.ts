// src/app/modules/layout/layout.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  
  currentUser: User | null = null;
  unreadMessagesCount = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur courant
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Si l'utilisateur est connecté, initialiser le WebSocket
      if (user) {
        this.chatService.initializeWebSocketConnection(user.idUser);
        this.updateUnreadMessagesCount(user.idUser);
      }
    });
  }

  toggleSidenav(): void {
    this.drawer.toggle();
  }

  updateUnreadMessagesCount(userId: string): void {
    this.chatService.countUnreadMessages(userId).subscribe(
      response => {
        this.unreadMessagesCount = response.unreadCount;
      },
      error => {
        console.error('Erreur lors de la récupération des messages non lus:', error);
      }
    );
  }
}
