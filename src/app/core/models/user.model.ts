// src/app/core/models/user.model.ts
export interface UserProfile {
  id: {
    idUser: string;
    idProfil: number;
  };
  profil: {
    idProfil: number;
    libelProfil: string;
  };
  dateInit: Date;
  note: number;
}

export interface User {
  idUser: string;
  nom: string;
  prenom: string;
  mail: string;
  password: string;
  usersProfils: UserProfile[];
  // Ajout de la propriété qui manque
  isActive: boolean;
}