import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        // 🌟 UPDATED: Map existing items to support the new ProductDesignId
        items: this.order.items
          ? this.order.items.map((i: any) => ({
              ...i,
              selectedProductId: '',
              selectedDesignId: i.productDesignId || '',
              availableDesigns: [],
            }))
          : [],
      };
    } else {
      this.orderData.orderDate = new Date().toISOString().split('T')[0];
      this.addItem();
    }
  }

  loadDropdownData() {
    this.clientService.getClients().subscribe({
      next: (data) => (this.clientsList = data),
      error: (err) => console.error('Failed to load clients', err),
    });

    this.productService.getProducts().subscribe({
      next: (data) => (this.productsList = data),
      error: (err) => console.error('Failed to load products', err),
    });
  }

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

  onProductChange(item: any) {
    if (!item.selectedProductId) return;

    item.selectedDesignId = '';
    item.productName = '';
    item.articleNumber = '';

    this.productService.getProductDesigns(item.selectedProductId).subscribe({
      next: (data) => (item.availableDesigns = data),
      error: (err) => console.error('Failed to load designs for product', err),
    });
  }

  onDesignChange(item: any) {
    const selected = item.availableDesigns.find((d: any) => d.id == item.selectedDesignId);

    if (selected) {
      item.productName = selected.designName;
      item.articleNumber = selected.articleNumber || 'N/A';
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

    payload.items = this.orderData.items.map((item: any) => ({
      id: item.id || 0,
      productName: item.productName,
      articleNumber: item.articleNumber,
      quantity: item.quantity,
      productDesignId: item.selectedDesignId ? Number(item.selectedDesignId) : null,
    }));

    this.save.emit(payload);
  }
}
