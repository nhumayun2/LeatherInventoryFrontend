import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.html',
  styleUrl: './product-modal.css',
})
export class ProductModal {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  categoryData = {
    Name: '',
    Description: '',
  }

  closeModal(){
    this.close.emit();
  }
  saveCategory() {
    // Check the capitalized .Name
    if (!this.categoryData.Name.trim()) {
      alert("Category Name is required!");
      return;
    }
    
    // Send the correctly formatted package to the parent page
    this.save.emit(this.categoryData);
  }
  
}
