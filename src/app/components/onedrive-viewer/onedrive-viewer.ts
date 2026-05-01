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

  openEditorTab() {
    // For OneDrive documents
    if (this.document?.webUrl) {
      window.open(this.document.webUrl, '_blank');
    } 
    // Fallback for Costing Sheets (local DB)
    else if (this.document?.previewUrl) {
      window.open(this.document.previewUrl, '_blank');
    }
  }

  closePreview() {
    this.close.emit();
  }
}