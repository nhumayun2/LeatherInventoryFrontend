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
  isSaving = false;

  statuses = ['In Progress', 'Completed'];

  clientsList: any[] = [];
  productsList: any[] = [];

  orderData = {
    id: 0,
    poNumber: '',
    companyName: '',
    orderDate: '',
    deliveryDate: '' as string | null,
    status: 'In Progress',
    items: [] as any[],
  };

  constructor(
    private clientService: Client,
    private productService: Product,
  ) {}

  ngOnInit() {
    // 🌟 FIX: Start loading data first, THEN process the edit order!
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
        status: this.order.status || 'In Progress',
        items: [], // We will populate this AFTER products load!
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
      next: (data) => {
        this.productsList = data;
        // 🌟 FIX: Now that products are loaded, rebuild the items array for Edit Mode!
        if (this.isEditMode && this.order?.items) {
          this.populateEditItems();
        }
      },
      error: (err) => console.error('Failed to load products', err),
    });
  }

  populateEditItems() {
    this.orderData.items = this.order.items.map((i: any) => {
      let parentProductId = '';
      let availableDesigns: any[] = [];

      // Search through loaded products to find which category this design belongs to
      if (i.productDesignId) {
        for (const prod of this.productsList) {
          if (prod.designs && prod.designs.some((d: any) => d.id === i.productDesignId)) {
            parentProductId = prod.id;
            availableDesigns = prod.designs;
            break;
          }
        }
      }

      return {
        id: i.id,
        productName: i.productName,
        articleNumber: i.articleNumber,
        quantity: i.quantity,
        selectedProductId: parentProductId,
        selectedDesignId: i.productDesignId || '',
        availableDesigns: availableDesigns,
      };
    });
  }

  closeModal() {
    this.close.emit();
  }

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

    // 🌟 OPTIMIZATION: Grab designs directly from pre-loaded productsList (No API call needed)
    const selectedProduct = this.productsList.find(p => p.id == item.selectedProductId);
    item.availableDesigns = selectedProduct ? selectedProduct.designs : [];
  }

  onDesignChange(item: any) {
    const selected = item.availableDesigns.find((d: any) => d.id == item.selectedDesignId);

    if (selected) {
      item.productName = selected.designName;
      item.articleNumber = selected.karigarArticleNumber || 'N/A';
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

    if (this.isSaving) return;
    this.isSaving = true;

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