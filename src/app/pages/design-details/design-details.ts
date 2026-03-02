import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 🌟 NEW: Needed to fetch the Excel file
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

  // UI State Tracking for the Gallery & Lightbox
  selectedImageIndex: number = 0;
  isLightboxOpen: boolean = false;

  // 🌟 NEW: UI State Tracking for the Excel Costing Preview
  isExcelPreviewOpen: boolean = false;
  excelLoading: boolean = false;
  excelData: any[][] = []; // This will hold the rows and columns of the spreadsheet

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: Product,
    private http: HttpClient, // 🌟 NEW: Injected HttpClient
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

  // --- 🌟 NEW: EXCEL COSTING LOGIC 🌟 ---

  // Helper to generate the full URL to the file on your C# backend
  getCostingFileUrl(): string | null {
    if (!this.design?.costingFilePath) return null;
    return `https://localhost:7201${this.design.costingFilePath}`;
  }

  downloadCostingFile() {
    const url = this.getCostingFileUrl();
    if (url) {
      // Opens the file URL in a new tab, which triggers a download for .xlsx files
      window.open(url, '_blank');
    }
  }

  async previewCostingFile() {
    const url = this.getCostingFileUrl();
    if (!url) return;

    this.isExcelPreviewOpen = true;
    this.excelLoading = true;

    try {
      // 1. Fetch the actual file from the C# server as an ArrayBuffer
      const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();

      // 2. Dynamically import the xlsx library so it doesn't slow down the initial page load!
      const XLSX = await import('xlsx');

      // 3. Read the file buffer
      if (response) {
        const workbook = XLSX.read(response, { type: 'array' });

        // 4. Grab the first sheet in the Excel file
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 5. Convert that sheet into a 2D JSON array (rows and columns) for our HTML table!
        this.excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }
    } catch (error) {
      console.error('Error loading Excel file', error);
      alert('Failed to load the Excel file preview. It might be corrupted or missing.');
      this.isExcelPreviewOpen = false;
    } finally {
      this.excelLoading = false;
    }
  }

  closeExcelPreview() {
    this.isExcelPreviewOpen = false;
    this.excelData = []; // Clear the data from memory when closed
  }

  // --- Image Gallery Logic ---

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  // --- Lightbox Logic ---

  openLightbox(index: number = this.selectedImageIndex) {
    this.selectedImageIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }

  nextImage(event?: Event) {
    if (event) event.stopPropagation();
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
    // Escape key closes either the lightbox OR the Excel preview
    if (event.key === 'Escape') {
      if (this.isLightboxOpen) this.closeLightbox();
      if (this.isExcelPreviewOpen) this.closeExcelPreview();
    }

    // Only handle arrows if lightbox is open
    if (this.isLightboxOpen) {
      if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
    }
  }
}
