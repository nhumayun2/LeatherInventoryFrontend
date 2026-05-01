import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../services/product';
import { OnedriveViewer } from '../../components/onedrive-viewer/onedrive-viewer';

@Component({
  selector: 'app-design-details',
  standalone: true,
  // 2. Add it to imports
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

  getCostingFileUrl(): string | null {
    if (!this.design?.costingFilePath) return null;
    return `https://localhost:7201${this.design.costingFilePath}`;
  }

  downloadCostingFile() {
    const url = this.getCostingFileUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  // 3. The New Preview Logic
  previewCostingFile() {
    const url = this.getCostingFileUrl();
    if (!url) return;

    // We use Microsoft's public viewer to read the file.
    // NOTE: This will only load successfully once your backend is deployed live. 
    // Microsoft's cloud servers cannot reach your local "https://localhost:7201" to render it during dev!
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    this.costingDoc = {
      fileName: 'Costing Sheet Preview',
      previewUrl: officeViewerUrl,
      webUrl: url
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