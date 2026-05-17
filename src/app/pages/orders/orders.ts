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
  statuses: string[] = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

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

        // Apply filters and our new sorting logic immediately upon loading
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load orders', err),
    });
  }

  // Runs every time the user types in the search bar, changes the status, or when data first loads
  // Runs every time the user types in the search bar, changes the status, or when data first loads
  applyFilters() {
    // 1. Filter by Search and Status
    let tempFiltered = this.orders.filter((order) => {
      const searchStr = this.searchQuery.toLowerCase();
      const matchesSearch =
        (order.companyName && order.companyName.toLowerCase().includes(searchStr)) ||
        (order.poNumber && order.poNumber.toLowerCase().includes(searchStr));

      const matchesStatus = this.selectedStatus === 'All' || order.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // 2. Advanced Priority Sorting (The "Urgency Queue")
    this.filteredOrders = tempFiltered.sort((a, b) => {
      // Define active vs inactive (We don't want 'Completed' orders clogging the top of the queue)
      const isActiveA = a.status === 'Pending' || a.status === 'In Progress';
      const isActiveB = b.status === 'Pending' || b.status === 'In Progress';

      // RULE 1: Active orders ALWAYS go above Inactive (Completed/Cancelled) orders
      if (isActiveA && !isActiveB) return -1;
      if (!isActiveA && isActiveB) return 1;

      // RULE 2: If both are inactive, push the newest to the top of the bottom pile
      if (!isActiveA && !isActiveB) {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      }

      // RULE 3: Both are active. Check for Delivery Dates.
      // Convert to timestamps. Invalid/Empty dates become NaN safely.
      const timeA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : NaN;
      const timeB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : NaN;

      const hasDateA = !isNaN(timeA);
      const hasDateB = !isNaN(timeB);

      // RULE 4: If one has a valid delivery date and the other is TBD, the valid date goes to the top
      if (hasDateA && !hasDateB) return -1;
      if (!hasDateA && hasDateB) return 1;

      // RULE 5: Both are TBD (No delivery date). Sort by Newest Order Date.
      if (!hasDateA && !hasDateB) {
         return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      }

      // RULE 6: Both have valid Delivery Dates! Sort strictly by Nearest Date (Ascending: May 18 -> May 19)
      return timeA - timeB;
    });
  }

  // Loops through the OrderItems list and sums up the Quantity of all products in the order
  getTotalQuantity(order: any): number {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
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

  // View Modal Controls
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
    // For Orders, sending standard JSON back to the C# backend, no FormData needed!
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