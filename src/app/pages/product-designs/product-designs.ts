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

  // Track which design is currently being edited
  selectedDesignToEdit: any = null;

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
      error: (err: any) => {
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

  // Accepts an optional design to edit
  openModal(design?: any, event?: Event) {
    if (event) event.stopPropagation(); // Prevents navigating to the details page

    this.selectedDesignToEdit = design || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedDesignToEdit = null;
  }

  // 🌟 FIXED: Now correctly unwraps the new 3-part payload!
  handleSaveDesign(payload: {
    designData: any;
    imageFiles: File[];
    costingFile: File | undefined;
  }) {
    const designData = payload.designData;
    const imageFiles = payload.imageFiles;
    const costingFile = payload.costingFile;

    designData.productId = this.productId;

    if (designData.id && designData.id > 0) {
      // --- UPDATE EXISTING ---
      // 🌟 Passes the costingFile to the service
      this.productService
        .updateDesign(designData.id, designData, imageFiles, costingFile)
        .subscribe({
          next: () => {
            this.loadDesignsForThisProduct();
            this.closeModal();
          },
          error: (err: any) => {
            console.error('Failed to update design:', err);
          },
        });
    } else {
      // --- CREATE NEW ---
      // 🌟 Passes the costingFile to the service
      this.productService.createDesign(designData, imageFiles, costingFile).subscribe({
        next: (savedDesignFromDb) => {
          console.log('Saved new design from backend:', savedDesignFromDb);
          this.designs.unshift(savedDesignFromDb);
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Failed to save new design:', err);
        },
      });
    }
  }

  // Delete a product design
  deleteDesign(id: number, event: Event) {
    if (event) event.stopPropagation();

    if (confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      this.productService.deleteDesign(id).subscribe({
        next: () => {
          this.designs = this.designs.filter((d) => d.id !== id);
        },
        error: (err: any) => console.error('Failed to delete design', err),
      });
    }
  }
}
