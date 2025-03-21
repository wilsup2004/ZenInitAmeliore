import { PriseEnCharge } from "./prise-en-charge.model";
import { User } from "./user.model";

// src/app/core/models/colis.model.ts
export interface Statut {
  idStatut: number;
  libelStatut: string;
}

export interface Colis {
  idColis: number;
  statuts: Statut;
  users: User;
  longueur: number;
  largeur: number;
  hauteur: number;
  nbKilo: number;
  tarif: number;
  horodatage: Date;
  villeDepart: string;
  villeArrivee: string;
  description: string;
  photoPath: string;
  priseEnCharges?: PriseEnCharge[];
}