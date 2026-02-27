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

  // 🌟 NEW: Catch the existing design data if we are editing
  @Input() design: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  clients: any[] = [];

  selectedImages: File[] = [];
  previewUrls: string[] = [];

  // 🌟 NEW: Track edit mode and existing images
  isEditMode = false;
  existingImageUrls: string[] = [];

  tags: string[] = [];
  features: string[] = [];
  currentTag: string = '';
  currentFeature: string = '';

  designData = {
    id: 0, // Needed for updates to tell the backend which item to edit
    productId: 0,
    designName: '',
    sku: '',
    price: 0,
    clientId: null as number | null,
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

    // 🌟 NEW: Pre-fill the form if we are in Edit Mode!
    if (this.design) {
      this.isEditMode = true;
      this.designData = {
        id: this.design.id,
        productId: this.design.productId,
        designName: this.design.designName,
        sku: this.design.sku || '',
        price: this.design.price,
        clientId: this.design.clientId || null,
        status: this.design.status || 'In Production',
        quantityReady: this.design.quantityReady || 0,
        quantityInProduction: this.design.quantityInProduction || 0,
        quantityDamaged: this.design.quantityDamaged || 0,
        unit: this.design.unit || 'pcs',
        specifications: this.design.specifications || '',
      };

      // Load existing arrays using the spread operator [...] so we don't mutate the original data
      this.tags = this.design.tags ? [...this.design.tags] : [];
      this.features = this.design.features ? [...this.design.features] : [];

      // Keep track of the images already saved in the database
      this.existingImageUrls = this.design.imageUrls ? [...this.design.imageUrls] : [];
    }
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

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      files.forEach((file) => {
        this.selectedImages.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

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

    this.save.emit({ data: payloadData, files: this.selectedImages });
  }
}
