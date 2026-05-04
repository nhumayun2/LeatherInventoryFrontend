import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../services/product';
import { OnedriveViewer } from '../../components/onedrive-viewer/onedrive-viewer';

@Component({
  selector: 'app-design-details',
  standalone: true,
  imports: [CommonModule, OnedriveViewer],
  templateUrl: './design-details.html',
  styleUrl: './design-details.css',
})
export class DesignDetails implements OnInit {
  productId: number = 0;
  designId: number = 0;
  design: any = null;

  selectedImageIndex: number = 0;
  isLightboxOpen: boolean = false;

  // --- Costing Sheet Viewer State ---
  isExcelPreviewOpen: boolean = false; 
  costingDoc: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: Product
  ) {}

  ngOnInit() {
    this.readUrlAndFetchData();
  }

  readUrlAndFetchData() {
    const pId = this.route.snapshot.paramMap.get('productId');
    const dId = this.route.snapshot.paramMap.get('designId');

    if (pId !== null && dId !== null) {
      this.productId = Number(pId);
      this.designId = Number(dId);
      this.loadSingleDesign();
    }
  }

  loadSingleDesign() {
    this.productService.getDesignById(this.designId).subscribe({
      next: (data) => {
        this.design = data;
        this.selectedImageIndex = 0;
      },
      error: (err) => console.error('Could not find this design', err),
    });
  }

  goBackToCategory() {
    this.router.navigate(['/products', this.productId]);
  }

  // 🌟 UPDATED: Open the Microsoft OneDrive Web URL in a new tab
  downloadCostingFile() {
    if (this.design?.costingWebUrl) {
      window.open(this.design.costingWebUrl, '_blank');
    }
  }

  // 🌟 UPDATED: Feed the actual cloud data to your OneDrive Viewer component!
  previewCostingFile() {
    if (!this.design?.costingPreviewUrl) return;

    this.costingDoc = {
      fileName: this.design.costingFileName || 'Costing Sheet',
      previewUrl: this.design.costingPreviewUrl,
      webUrl: this.design.costingWebUrl
    };
    
    this.isExcelPreviewOpen = true;
  }

  // --- Image Gallery Logic ---
  selectImage(index: number) { this.selectedImageIndex = index; }
  openLightbox(index: number = this.selectedImageIndex) { this.selectedImageIndex = index; this.isLightboxOpen = true; }
  closeLightbox() { this.isLightboxOpen = false; }
  
  nextImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.design?.imageUrls?.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.design.imageUrls.length;
    }
  }
  
  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.design?.imageUrls?.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.design.imageUrls.length) % this.design.imageUrls.length;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.isLightboxOpen) this.closeLightbox();
      if (this.isExcelPreviewOpen) this.isExcelPreviewOpen = false;
    }
    if (this.isLightboxOpen) {
      if (event.key === 'ArrowRight') this.nextImage();
      else if (event.key === 'ArrowLeft') this.prevImage();
    }
  }
}