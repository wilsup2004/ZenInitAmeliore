// src/app/core/models/message.model.ts
export interface Message {
  idPrise: number;
  idUserPrise: string;
  idUserColis: string;
  sender: string;
  horodatage: Date;
  message: string;
  isRead: boolean;
  notificationSent: boolean;
}