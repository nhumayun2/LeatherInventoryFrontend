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
  @Input() design: any = null;
  @Input() productId: number = 0;

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<{
    designData: any;
    imageFiles: File[];
    costingFile: File | undefined;
  }>();

  isEditMode = false;
  clientsList: any[] = [];
  statuses = ['In Production', 'Ready', 'Discontinued'];

  designData = {
    id: 0,
    productId: 0,
    designName: '',
    articleNumber: '',
    price: 0,
    clientId: null as number | null,
    status: 'In Production',
    unit: 'pcs',
    specifications: '',
    // 🌟 NEW: Only tracking Stock here now!
    stock: 0,
    features: [] as string[],
    tags: [] as string[],
  };

  newFeature = '';
  newTag = '';

  selectedImages: File[] = [];
  existingImageUrls: string[] = [];

  costingFile: File | undefined;
  costingFileName = '';

  constructor(private clientService: Client) {}

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (data) => (this.clientsList = data),
      error: (err) => console.error('Failed to load clients', err),
    });

    if (this.design) {
      this.isEditMode = true;
      this.designData = {
        id: this.design.id,
        productId: this.design.productId,
        designName: this.design.designName || '',
        articleNumber: this.design.articleNumber || '',
        price: this.design.price || 0,
        clientId: this.design.clientId || null,
        status: this.design.status || 'In Production',
        unit: this.design.unit || 'pcs',
        specifications: this.design.specifications || '',
        // 🌟 NEW: Load existing stock
        stock: this.design.stock || 0,
        features: this.design.features ? [...this.design.features] : [],
        tags: this.design.tags ? [...this.design.tags] : [],
      };

      this.existingImageUrls = this.design.imageUrls ? [...this.design.imageUrls] : [];

      if (this.design.costingFilePath) {
        this.costingFileName =
          this.design.costingFilePath.split('/').pop() || 'Existing Costing File';
      }
    } else {
      this.designData.productId = this.productId;
    }
  }

  closeModal() {
    this.close.emit();
  }

  addFeature() {
    if (this.newFeature.trim()) {
      this.designData.features.push(this.newFeature.trim());
      this.newFeature = '';
    }
  }
  removeFeature(index: number) {
    this.designData.features.splice(index, 1);
  }

  addTag() {
    if (this.newTag.trim()) {
      this.designData.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }
  removeTag(index: number) {
    this.designData.tags.splice(index, 1);
  }

  onImagesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedImages.push(...files);
  }
  removeSelectedImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  onCostingFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'xlsx' || extension === 'xls') {
        this.costingFile = file;
        this.costingFileName = file.name;
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls) for Costing.');
        event.target.value = '';
      }
    }
  }

  removeCostingFile() {
    this.costingFile = undefined;
    this.costingFileName = '';
  }

  saveDesign() {
    if (!this.designData.designName.trim()) {
      alert('Design Name is strictly required.');
      return;
    }

    this.save.emit({
      designData: this.designData,
      imageFiles: this.selectedImages,
      costingFile: this.costingFile,
    });
  }
}
