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
    // Look for the URL regardless of which page sent it (Design Details vs Finance DB)
    const targetUrl = this.document?.webUrl || this.document?.cloudinaryUrl || this.document?.previewUrl;

    if (targetUrl) {
      window.open(targetUrl, '_blank');
    } else {
      console.error("No valid URL found on this document object:", this.document);
      alert("Error: Could not find the file link.");
    }
  }

  closePreview() {
    this.close.emit();
  }
}