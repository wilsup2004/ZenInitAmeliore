import { Colis } from "./colis.model";
import { PriseEnCharge } from "./prise-en-charge.model";
import { User } from "./user.model";

// src/app/core/models/payment.model.ts
export interface PaymentMethod {
  idMethod: number;
  methodName: string;
  methodDescription: string;
  isActive: boolean;
}

export interface Payment {
  idPayment: number;
  user: User;
  colis: Colis;
  priseEnCharge: PriseEnCharge;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  paymentStatus: string;
  paymentDate: Date;
  transactionId: string;
  paymentDetails: string;
}
