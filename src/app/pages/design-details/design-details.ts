import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../services/product';

@Component({
  selector: 'app-design-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './design-details.html',
  styleUrl: './design-details.css',
})
export class DesignDetails implements OnInit {
  productId: number = 0;
  designId: number = 0;

  // Holds our single design object from the database
  design: any = null;

  // 🌟 NEW: UI State Tracking for the Gallery & Lightbox 🌟
  selectedImageIndex: number = 0;
  isLightboxOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: Product,
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
        console.log('Success! Found single design:', data);
        this.design = data;
        // Reset image index just in case
        this.selectedImageIndex = 0;
      },
      error: (err) => {
        console.error('Could not find this design', err);
      },
    });
  }

  goBackToCategory() {
    this.router.navigate(['/products', this.productId]);
  }

  // --- 🌟 NEW: Image Gallery Logic 🌟 ---

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  // --- 🌟 NEW: Lightbox Logic 🌟 ---

  openLightbox(index: number = this.selectedImageIndex) {
    this.selectedImageIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }

  nextImage(event?: Event) {
    if (event) event.stopPropagation(); // Prevents clicks from accidentally closing the lightbox
    if (this.design?.imageUrls && this.design.imageUrls.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.design.imageUrls.length;
    }
  }

  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.design?.imageUrls && this.design.imageUrls.length > 0) {
      this.selectedImageIndex =
        (this.selectedImageIndex - 1 + this.design.imageUrls.length) % this.design.imageUrls.length;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isLightboxOpen) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    }
  }
}
