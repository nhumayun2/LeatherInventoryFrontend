import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product';
import { Router, ActivatedRoute } from '@angular/router';
import { DesignModal } from '../../components/design-modal/design-modal';

@Component({
  selector: 'app-product-designs',
  standalone: true,
  imports: [CommonModule, DesignModal],
  templateUrl: './product-designs.html',
  styleUrl: './product-designs.css',
})
export class ProductDesigns implements OnInit {
  productId: number = 0;
  designs: any[] = [];

  isModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: Product,
  ) {}

  ngOnInit() {
    this.readUrlAndFetchData();
  }

  readUrlAndFetchData() {
    const idFromUrl = this.route.snapshot.paramMap.get('id');

    if (idFromUrl !== null) {
      this.productId = Number(idFromUrl);
      this.loadDesignsForThisProduct();
    }
  }

  loadDesignsForThisProduct() {
    this.productService.getProductDesigns(this.productId).subscribe({
      next: (data) => {
        console.log('Designs for product', this.productId, ':', data);
        this.designs = data;
      },
      error: (err) => {
        console.error('Failed to load designs for product', this.productId, err);
        this.designs = [];
      },
    });
  }

  goToDesignDetails(designId: number) {
    this.router.navigate(['/products', this.productId, 'designs', designId]);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // 🌟 CHANGED: Now expects payload.files (an array) instead of a single file
  handleSaveDesign(payload: any) {
    const designData = payload.data || payload;
    const imageFiles = payload.files || undefined; // Grab the array of files!

    designData.productId = this.productId;

    // Pass the array of files to our updated Product service
    this.productService.createDesign(designData, imageFiles).subscribe({
      next: (savedDesignFromDb) => {
        console.log('Saved new design from backend:', savedDesignFromDb);
        this.designs.unshift(savedDesignFromDb);
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to save new design:', err);
      },
    });
  }
}
