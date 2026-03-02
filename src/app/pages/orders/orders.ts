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

  // The list currently shown on screen (after searching/filtering)
  filteredOrders: any[] = [];

  // UI State for Filters
  searchQuery: string = '';
  selectedStatus: string = 'All';

  // Standard statuses matching your C# default "Pending"
  statuses: string[] = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  // UI State for Modal
  isModalOpen = false;
  selectedOrderToEdit: any = null;

  constructor(private orderService: Order) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log('Loaded Orders:', data);
        this.orders = data;

        // Apply initial filters to populate the table
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load orders', err),
    });
  }

  // Runs every time the user types in the search bar or changes the status dropdown
  applyFilters() {
    this.filteredOrders = this.orders.filter((order) => {
      // 1. Check Search Query (matches Company Name or PO Number)
      const searchStr = this.searchQuery.toLowerCase();
      const matchesSearch =
        (order.companyName && order.companyName.toLowerCase().includes(searchStr)) ||
        (order.poNumber && order.poNumber.toLowerCase().includes(searchStr));

      const matchesStatus = this.selectedStatus === 'All' || order.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // Loops through the OrderItems list and sums up the Quantity of all products in the order
  getTotalQuantity(order: any): number {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }

  openModal(order?: any) {
    this.selectedOrderToEdit = order || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrderToEdit = null;
  }

  handleSave(orderData: any) {
    // For Orders,sending standard JSON back to the C# backend, no FormData needed!
    if (orderData.id && orderData.id > 0) {
      this.orderService.updateOrder(orderData.id, orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update order', err),
      });
    } else {
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
    if (confirm('Are you sure you want to permanently delete this order?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Failed to delete order', err),
      });
    }
  }
}
