import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onedrive-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onedrive-viewer.html',
  styleUrl: './onedrive-viewer.css'
})
export class OnedriveViewer {
  @Input() document: any = null; 
  @Output() close = new EventEmitter<void>();

  get targetUrl(): string {
    if (!this.document) return '#';
    return this.document.webUrl || this.document.cloudinaryUrl || this.document.previewUrl || '#';
  }

  closePreview() {
    this.close.emit();
  }
}