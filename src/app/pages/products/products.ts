import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductModal } from '../../components/product-modal/product-modal';
import { Product } from '../../services/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductModal],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  isModalOpen = false;
  products: any[] = [];

  // 🌟 NEW: Track which product is currently being edited
  selectedProductToEdit: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private productService: Product,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Real data from backend:', data);
        this.products = data;

        this.products.forEach((p) => {
          p.currentImageIndex = 0;
          p.intervalId = null;
          if (!p.designs || p.designs.length === 0) {
            // Updated placeholder to use the new imageUrls array structure
            p.designs = [{ imageUrls: ['https://placehold.co/600x400?text=No+Design+Yet'] }];
          }
        });
      },
      error: (err) => {
        console.error('Failed to load products', err);
      },
    });
  }

  viewProductDesigns(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  // 🌟 CHANGED: Now accepts an optional product to edit
  openModal(product?: any, event?: Event) {
    if (event) event.stopPropagation(); // Prevents navigating to the designs page

    this.selectedProductToEdit = product || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProductToEdit = null;
  }

  // 🌟 CHANGED: Routes to either Update or Create based on the ID
  handleSave(categoryData: any) {
    // We map the capitalized UI fields back to the standard lowercase JSON format
    const payload = {
      name: categoryData.Name,
      description: categoryData.Description,
    };

    if (categoryData.id && categoryData.id > 0) {
      // --- UPDATE EXISTING ---
      const updatePayload = { id: categoryData.id, ...payload };

      this.productService.updateProduct(categoryData.id, updatePayload).subscribe({
        next: () => {
          // Update the local array so the UI changes instantly without refreshing
          const index = this.products.findIndex((p) => p.id === categoryData.id);
          if (index !== -1) {
            this.products[index].name = categoryData.Name;
            this.products[index].description = categoryData.Description;
          }
          this.closeModal();
        },
        error: (err) => console.error('Failed to update product', err),
      });
    } else {
      // --- CREATE NEW ---
      this.productService.createProduct(payload).subscribe({
        next: (savedProductFromDb) => {
          console.log('Saved product from backend:', savedProductFromDb);
          savedProductFromDb.currentImageIndex = 0;
          savedProductFromDb.intervalId = null;
          savedProductFromDb.designs = [
            { imageUrls: ['https://placehold.co/600x400?text=No+Design+Yet'] },
          ];

          this.products.unshift(savedProductFromDb);
          this.closeModal();
        },
        error: (err) => console.error('Failed to save new product', err),
      });
    }
  }

  // 🌟 NEW: Delete a product
  deleteProduct(id: number, event: Event) {
    if (event) event.stopPropagation();

    // Browser confirmation prompt to prevent accidental clicks
    if (
      confirm(
        'Are you sure you want to delete this category? All designs inside it will be permanently lost.',
      )
    ) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          // Remove the deleted product from the UI array
          this.products = this.products.filter((p) => p.id !== id);
        },
        error: (err) => console.error('Failed to delete product', err),
      });
    }
  }

  startCycling(product: any) {
    if (product.intervalId) return;

    product.intervalId = setInterval(() => {
      product.currentImageIndex = (product.currentImageIndex + 1) % product.designs.length;
      this.cdr.detectChanges();
    }, 1200);
  }

  stopCycling(product: any) {
    if (product.intervalId) {
      clearInterval(product.intervalId);
      product.intervalId = null;
    }
    product.currentImageIndex = 0;
  }
}
