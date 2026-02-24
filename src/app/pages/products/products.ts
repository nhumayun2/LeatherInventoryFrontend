import { Component, ChangeDetectorRef, OnInit } from '@angular/core'; // 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ProductModal } from '../../components/product-modal/product-modal';
import { Product } from '../../services/product'; // 2. Import our ProductService
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductModal], 
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

isModalOpen = false;
  
  // Start with an empty array
  products: any[] = []; 

  // Inject our Service
  constructor(
    private cdr: ChangeDetectorRef,
    private productService: Product,
    private router: Router
  ) {}

  // This runs automatically when the page loads
  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // Call the service, subscribe to the response
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log("Real data from backend:", data); // Check console!
        this.products = data;
        
        // We need to add our UI properties (timers, etc) to the real data
        this.products.forEach(p => {
          p.currentImageIndex = 0;
          p.intervalId = null;
          // If the product has no designs yet from the DB, give it a placeholder
          if (!p.designs || p.designs.length === 0) {
            p.designs = [{ imageUrl: 'https://placehold.co/600x400?text=No+Design+Yet' }];
          }
        });
      },
      error: (err) => {
        console.error("Failed to load products", err);
      }
    });
  }

  viewProductDesigns(productId: number){
    this.router.navigate(['/products', productId]);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleSave(newProduct: any) {
    this.productService.createProduct(newProduct).subscribe({
      next: (savedProductFromDb) => {
        console.log("Saved product from backend:", savedProductFromDb);

        savedProductFromDb.currentImageIndex = 0;
        savedProductFromDb.intervalId = null;
        savedProductFromDb.designs = [{ imageUrl: 'https://placehold.co/600x400?text=No+Design+Yet' }];

        this.products.unshift(savedProductFromDb);
        this.closeModal();
      },
      error: (err) => {
        console.error("Failed to save new product", err);
      }
    });
  }

  // --- FIXED HOVER LOGIC ---
  
  startCycling(product: any) {
    // If a timer is already running, don't start another one
    if (product.intervalId) return;

    // console.log('Started cycling:', product.name); // Debugging

    // Store the timer on THIS specific product
    product.intervalId = setInterval(() => {
      
      // Update the index
      product.currentImageIndex = (product.currentImageIndex + 1) % product.designs.length;
      
      // FORCE ANGULAR TO UPDATE THE SCREEN
      this.cdr.detectChanges(); 

    }, 1200); // 1.2 seconds speed
  }

  stopCycling(product: any) {
    // Clear the specific timer for this product
    if (product.intervalId) {
      clearInterval(product.intervalId);
      product.intervalId = null;
    }
    
    // Reset to the first image immediately
    product.currentImageIndex = 0;
  }
}