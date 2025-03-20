// src/app/modules/colis/components/image-upload/image-upload.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() label: string = 'Ajouter une image';
  @Input() accept: string = 'image/*';
  @Input() maxSize: number = 5 * 1024 * 1024; // 5MB par défaut
  @Output() fileSelected = new EventEmitter<File>();
  
  imageUrl: SafeUrl | null = null;
  dragOver = false;
  errorMessage: string | null = null;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }
  
  processFile(file: File): void {
    this.errorMessage = null;
    
    // Vérifier le type du fichier
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Le fichier doit être une image.';
      return;
    }
    
    // Vérifier la taille du fichier
    if (file.size > this.maxSize) {
      this.errorMessage = `La taille de l'image ne doit pas dépasser ${this.maxSize / (1024 * 1024)}MB.`;
      return;
    }
    
    // Créer une URL pour l'aperçu
    const url = URL.createObjectURL(file);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    
    // Émettre le fichier sélectionné
    this.fileSelected.emit(file);
  }
  
  removeImage(): void {
    this.imageUrl = null;
    this.errorMessage = null;
    this.fileSelected.emit(null);
  }
}
