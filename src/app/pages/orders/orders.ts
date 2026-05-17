import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../services/order';
import { OrderModal } from '../../components/order-modal/order-modal';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderModal],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  // Master list from the database
  orders: any[] = [];

  // The list currently shown on screen (after searching/filtering/sorting)
  filteredOrders: any[] = [];

  // UI State for Filters
  searchQuery: string = '';
  selectedStatus: string = 'All';

  // Standard statuses matching your C# default "Pending"
  statuses: string[] = ['All', 'In Progress', 'Completed'];

  // UI State for Edit Modal
  isModalOpen = false;
  selectedOrderToEdit: any = null;

  // UI State for the Read-Only View Modal
  isViewModalOpen = false;
  selectedOrderToView: any = null;

  constructor(private orderService: Order) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log('Loaded Orders:', data);
        this.orders = data;

        // Apply filters and sorting immediately after loading
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load orders', err),
    });
  }

  // Runs every time search/filter changes
  applyFilters() {
    // 1. FILTERING
    let tempFiltered = this.orders.filter((order) => {
      const searchStr = this.searchQuery.toLowerCase();

      const matchesSearch =
        (order.companyName &&
          order.companyName.toLowerCase().includes(searchStr)) ||
        (order.poNumber &&
          order.poNumber.toLowerCase().includes(searchStr));

      const matchesDropdown =
        this.selectedStatus === 'All' ||
        order.status === this.selectedStatus;

      // Only allow these statuses
      const isAllowedStatus =
        order.status === 'In Progress' ||
        order.status === 'Completed';

      return matchesSearch && matchesDropdown && isAllowedStatus;
    });

    // 2. SORTING
    // 2. SORTING
this.filteredOrders = tempFiltered.sort((a, b) => {

  // RULE 1:
  // "In Progress" always above "Completed"
  if (a.status === 'In Progress' && b.status === 'Completed') {
    return -1;
  }

  if (a.status === 'Completed' && b.status === 'In Progress') {
    return 1;
  }

  // Convert delivery dates
  const dateA = a.deliveryDate
    ? new Date(a.deliveryDate).getTime()
    : Infinity;

  const dateB = b.deliveryDate
    ? new Date(b.deliveryDate).getTime()
    : Infinity;

  // RULE 2:
  // In Progress => nearest upcoming first (ASC)
  if (a.status === 'In Progress' && b.status === 'In Progress') {
    return dateA - dateB;
  }

  // RULE 3:
  // Completed => latest completed first (DESC)
  if (a.status === 'Completed' && b.status === 'Completed') {
    return dateB - dateA;
  }

  return 0;
});
  }

  // Loops through the OrderItems list and sums total quantity
  getTotalQuantity(order: any): number {
    if (!order.items || !Array.isArray(order.items)) return 0;

    return order.items.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    );
  }

  // --- Edit Modal Controls ---
  openModal(order?: any) {
    this.selectedOrderToEdit = order || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrderToEdit = null;
  }

  // --- View Modal Controls ---
  openViewModal(order: any) {
    this.selectedOrderToView = order;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedOrderToView = null;
  }

  // --- Data Operations ---
  handleSave(orderData: any) {
    // UPDATE
    if (orderData.id && orderData.id > 0) {
      this.orderService.updateOrder(orderData.id, orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update order', err),
      });
    }

    // CREATE
    else {
      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
        },
        error: (err) => console.error('Failed to create order', err),
      });
    }
  }

  deleteOrder(id: number) {
    if (
      confirm(
        'Are you sure you want to permanently delete this order?'
      )
    ) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Failed to delete order', err),
      });
    }
  }
}