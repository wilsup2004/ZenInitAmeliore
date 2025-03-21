import { Colis, Statut } from "./colis.model";
import { User } from "./user.model";

// src/app/core/models/prise-en-charge.model.ts
export interface PriseEnCharge {
  idPrise: number;
  colis: Colis;
  statuts: Statut;
  users: User;
  idVol: string;
  villeDepart: string;
  dateDepart: Date;
  villeArrivee: string;
  dateArrivee: Date;
}