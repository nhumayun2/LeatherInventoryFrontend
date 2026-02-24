import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../services/client';

@Component({
  selector: 'app-design-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './design-modal.html',
  styleUrl: './design-modal.css',
})
export class DesignModal implements OnInit {
  @Input() productId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  clients: any[] = [];

  // Replaced single File with Arrays for files and their visual previews
  selectedImages: File[] = [];
  previewUrls: string[] = [];

  tags: string[] = [];
  features: string[] = [];
  currentTag: string = '';
  currentFeature: string = '';

  designData = {
    productId: 0,
    designName: '',
    sku: '',
    price: 0,
    clientId: null,
    status: 'In Production',
    quantityReady: 0,
    quantityInProduction: 0,
    quantityDamaged: 0,
    unit: 'pcs',
    specifications: '',
  };

  constructor(private clientService: Client) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => (this.clients = data),
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  closeModal() {
    this.close.emit();
  }

  // Handles multiple files and generates preview URLs for the UI
  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      // Convert the FileList object to a standard Javascript Array
      const files = Array.from(input.files);

      files.forEach((file) => {
        this.selectedImages.push(file);

        // Use FileReader to create a temporary preview URL for the thumbnail
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // Clear the input value so the user can select the same file again if they remove it
      input.value = '';
    }
  }

  // Allows the user to remove an image before saving
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  addFeature(event: any) {
    event.preventDefault();
    const val = this.currentFeature.trim();
    if (val && !this.features.includes(val)) {
      this.features.push(val);
    }
    this.currentFeature = '';
  }

  removeFeature(index: number) {
    this.features.splice(index, 1);
  }

  addTag(event: any) {
    event.preventDefault();
    const val = this.currentTag.trim();
    if (val && !this.tags.includes(val)) {
      this.tags.push(val);
    }
    this.currentTag = '';
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  saveDesign() {
    if (!this.designData.designName.trim()) {
      alert('Please enter a design name.');
      return;
    }

    this.designData.productId = this.productId;

    const payloadData = {
      ...this.designData,
      tags: this.tags,
      features: this.features,
    };

    // emit "files" (plural) instead of a single file
    this.save.emit({ data: payloadData, files: this.selectedImages });
  }
}

// Prepare Invoice
// Prepare Challan
// Prepare Quotation
