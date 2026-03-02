import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Correctly importing your existing services
import { Client } from '../../services/client';
import { Product } from '../../services/product';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.css',
})
export class OrderModal implements OnInit {
  @Input() order: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = false;
  statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Lists to populate the initial dropdowns
  clientsList: any[] = [];
  productsList: any[] = [];

  orderData = {
    id: 0,
    poNumber: '',
    companyName: '',
    orderDate: '',
    deliveryDate: '' as string | null,
    status: 'Pending',
    items: [] as any[],
  };

  constructor(
    private clientService: Client,
    private productService: Product,
  ) {}

  ngOnInit() {
    this.loadDropdownData();

    if (this.order) {
      this.isEditMode = true;

      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
      };

      this.orderData = {
        id: this.order.id,
        poNumber: this.order.poNumber || '',
        companyName: this.order.companyName || '',
        orderDate: formatDate(this.order.orderDate),
        deliveryDate: formatDate(this.order.deliveryDate),
        status: this.order.status || 'Pending',
        // Map existing items to support the new UI arrays
        items: this.order.items
          ? this.order.items.map((i: any) => ({
              ...i,
              selectedProductId: '',
              selectedDesignId: '',
              availableDesigns: [], // Empty array until they select a product category
            }))
          : [],
      };
    } else {
      this.orderData.orderDate = new Date().toISOString().split('T')[0];
      this.addItem();
    }
  }

  loadDropdownData() {
    // Fetch Clients for the Company Dropdown
    this.clientService.getClients().subscribe({
      next: (data) => (this.clientsList = data),
      error: (err) => console.error('Failed to load clients', err),
    });

    // Fetch Base Products (Categories) for the first item dropdown
    this.productService.getProducts().subscribe({
      next: (data) => (this.productsList = data),
      error: (err) => console.error('Failed to load products', err),
    });
  }

  // 🌟 THE MISSING FUNCTION IS BACK!
  closeModal() {
    this.close.emit();
  }

  // --- Dynamic Item Array Management ---

  addItem() {
    this.orderData.items.push({
      selectedProductId: '',
      selectedDesignId: '',
      productName: '',
      articleNumber: '',
      quantity: 1,
      availableDesigns: [],
    });
  }

  removeItem(index: number) {
    this.orderData.items.splice(index, 1);
  }

  // STEP 1: They picked a Product Category. Now we fetch its specific designs!
  onProductChange(item: any) {
    if (!item.selectedProductId) return;

    // Clear out the second dropdown until the new data arrives
    item.selectedDesignId = '';
    item.productName = '';
    item.articleNumber = '';

    this.productService.getProductDesigns(item.selectedProductId).subscribe({
      next: (data) => (item.availableDesigns = data),
      error: (err) => console.error('Failed to load designs for product', err),
    });
  }

  // STEP 2: They picked the specific Design. Lock in the details!
  onDesignChange(item: any) {
    const selected = item.availableDesigns.find((d: any) => d.id == item.selectedDesignId);

    if (selected) {
      item.productName = selected.designName;
      item.articleNumber = selected.sku || 'N/A';
    }
  }

  saveOrder() {
    if (!this.orderData.poNumber.trim() || !this.orderData.companyName.trim()) {
      alert('PO Number and Company Name are strictly required!');
      return;
    }

    if (this.orderData.items.length === 0) {
      alert('An order must contain at least one item!');
      return;
    }

    const hasInvalidItems = this.orderData.items.some(
      (i) => !i.productName?.trim() || !i.articleNumber?.trim() || i.quantity < 1,
    );

    if (hasInvalidItems) {
      alert('All order items must have a valid design selected and a Quantity of at least 1.');
      return;
    }

    const payload = { ...this.orderData };
    if (!payload.deliveryDate) {
      payload.deliveryDate = null;
    }

    this.save.emit(payload);
  }
}
