import { User } from "./user.model";

// src/app/core/models/admin.model.ts
export interface AdminUser {
  idAdmin: number;
  user: User;
  adminLevel: number;
  creationDate: Date;
  lastLogin: Date;
}

export interface AdminLog {
  idLog: number;
  adminUser: AdminUser;
  actionType: string;
  actionDetails: string;
  actionDate: Date;
}