import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🌟 Added for search inputs
import { Product } from '../../services/product';
import { Router, ActivatedRoute } from '@angular/router';
import { DesignModal } from '../../components/design-modal/design-modal';

@Component({
  selector: 'app-product-designs',
  standalone: true,
  imports: [CommonModule, FormsModule, DesignModal],
  templateUrl: './product-designs.html',
  styleUrl: './product-designs.css',
})
export class ProductDesigns implements OnInit {
  productId: number = 0;

  // 🌟 NEW: Keep original data safe for filtering
  originalDesigns: any[] = [];
  designs: any[] = [];

  // 🌟 NEW: Filter and Search States
  searchQuery: string = '';
  selectedClient: string = '';
  selectedTag: string = '';
  selectedFeature: string = '';

  // 🌟 NEW: Dynamic Dropdown Options (Auto-populated!)
  uniqueClients: any[] = [];
  uniqueTags: string[] = [];
  uniqueFeatures: string[] = [];

  isModalOpen = false;
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
        this.originalDesigns = data; // 🌟 Store the original data
        this.designs = data;
        this.extractFilters(data); // 🌟 Extract tags/features for dropdowns
      },
      error: (err: any) => {
        console.error('Failed to load designs for product', this.productId, err);
        this.originalDesigns = [];
        this.designs = [];
      },
    });
  }

  // 🌟 NEW: Smart function to find all unique tags, features, and clients
  extractFilters(data: any[]) {
    const clientsMap = new Map();
    const tagsSet = new Set<string>();
    const featuresSet = new Set<string>();

    data.forEach((d) => {
      if (d.client) clientsMap.set(d.client.id, d.client);
      if (d.tags) d.tags.forEach((t: string) => tagsSet.add(t));
      if (d.features) d.features.forEach((f: string) => featuresSet.add(f));
    });

    this.uniqueClients = Array.from(clientsMap.values());
    this.uniqueTags = Array.from(tagsSet).sort();
    this.uniqueFeatures = Array.from(featuresSet).sort();
  }

  // 🌟 NEW: The live filtering engine
  applyFilters() {
    let temp = [...this.originalDesigns];

    // Search by Name, Karigar Article, or Client Article
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(
        (d) =>
          (d.designName && d.designName.toLowerCase().includes(q)) ||
          (d.karigarArticleNumber && d.karigarArticleNumber.toLowerCase().includes(q)) ||
          (d.clientArticleNumbers &&
            d.clientArticleNumbers.some((c: string) => c.toLowerCase().includes(q))),
      );
    }

    // Filter by Brand/Client
    if (this.selectedClient) {
      temp = temp.filter((d) => d.client && d.client.id === Number(this.selectedClient));
    }

    // Filter by Tag
    if (this.selectedTag) {
      temp = temp.filter((d) => d.tags && d.tags.includes(this.selectedTag));
    }

    // Filter by Feature
    if (this.selectedFeature) {
      temp = temp.filter((d) => d.features && d.features.includes(this.selectedFeature));
    }

    this.designs = temp;
  }

  // 🌟 NEW: Clear all filters
  clearFilters() {
    this.searchQuery = '';
    this.selectedClient = '';
    this.selectedTag = '';
    this.selectedFeature = '';
    this.applyFilters();
  }

  goToDesignDetails(designId: number) {
    this.router.navigate(['/products', this.productId, 'designs', designId]);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  openModal(design?: any, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedDesignToEdit = design || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedDesignToEdit = null;
  }

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
      this.productService.createDesign(designData, imageFiles, costingFile).subscribe({
        next: (savedDesignFromDb) => {
          console.log('Saved new design from backend:', savedDesignFromDb);

          // Refresh the whole list to ensure filters update properly
          this.loadDesignsForThisProduct();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Failed to save new design:', err);
        },
      });
    }
  }

  deleteDesign(id: number, event: Event) {
    if (event) event.stopPropagation();

    if (confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      this.productService.deleteDesign(id).subscribe({
        next: () => {
          // Remove from original designs and re-apply filters
          this.originalDesigns = this.originalDesigns.filter((d) => d.id !== id);
          this.applyFilters();
        },
        error: (err: any) => console.error('Failed to delete design', err),
      });
    }
  }
}
