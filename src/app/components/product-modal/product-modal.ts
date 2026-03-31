import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.html',
  styleUrl: './product-modal.css',
})
export class ProductModal implements OnInit {
  @Input() product: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode: boolean = false;

  // The Loading State Flag
  isSaving: boolean = false;

  categoryData = {
    id: 0,
    Name: '',
    Description: '',
  };

  ngOnInit() {
    if (this.product) {
      this.isEditMode = true;
      this.categoryData = {
        id: this.product.id,
        Name: this.product.name,
        Description: this.product.description || '',
      };
    }
  }

  closeModal() {
    this.close.emit();
  }

  saveCategory() {
    // Check the capitalized .Name
    if (!this.categoryData.Name.trim()) {
      alert('Category Name is required!');
      return;
    }

    //  Prevent multiple clicks by stopping the function if already saving
    if (this.isSaving) return;

    // Turn on the loading state!
    this.isSaving = true;

    // Send the correctly formatted package to the parent page
    this.save.emit(this.categoryData);
  }
}
