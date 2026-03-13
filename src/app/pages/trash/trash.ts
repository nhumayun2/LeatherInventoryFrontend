import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trash } from '../../services/trash';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trash.html',
  styleUrl: './trash.css',
})
export class TrashBin implements OnInit {
  trashItems: any[] = [];
  filteredItems: any[] = [];

  searchQuery: string = '';
  isLoading: boolean = true;

  // store selected items as a string combining type and ID (e.g., "Product-12")
  // This ensures we don't accidentally mix up a Product with ID 1 and an Order with ID 1.
  selectedItems: Set<string> = new Set();

  constructor(private trashService: Trash) {}

  ngOnInit() {
    this.loadTrash();
  }

  loadTrash() {
    this.isLoading = true;
    this.trashService.getTrash().subscribe({
      next: (data) => {
        this.trashItems = data;
        this.applyFilters();
        this.selectedItems.clear(); // Reset selections after loading fresh data
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load trash', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    if (!this.searchQuery) {
      this.filteredItems = [...this.trashItems];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredItems = this.trashItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) || item.type?.toLowerCase().includes(query),
      );
    }
  }

  // --- Bulk Selection Logic ---

  getItemKey(item: any): string {
    return `${item.type}-${item.id}`;
  }

  toggleSelection(item: any) {
    const key = this.getItemKey(item);
    if (this.selectedItems.has(key)) {
      this.selectedItems.delete(key);
    } else {
      this.selectedItems.add(key);
    }
  }

  isSelected(item: any): boolean {
    return this.selectedItems.has(this.getItemKey(item));
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      // Select all currently filtered items
      this.filteredItems.forEach((item) => this.selectedItems.add(this.getItemKey(item)));
    } else {
      // Deselect all
      this.selectedItems.clear();
    }
  }

  isAllSelected(): boolean {
    return (
      this.filteredItems.length > 0 &&
      this.filteredItems.every((item) => this.selectedItems.has(this.getItemKey(item)))
    );
  }

  // --- Bulk Action Logic ---

  getSelectedPayload() {
    // Convert our Set of "Type-ID" strings back into the array of objects the C# backend expects
    return Array.from(this.selectedItems).map((key) => {
      const [type, idStr] = key.split('-');
      return { id: parseInt(idStr, 10), type: type };
    });
  }

  restoreSelected() {
    if (this.selectedItems.size === 0) return;

    const payload = this.getSelectedPayload();
    this.trashService.restoreItems(payload).subscribe({
      next: () => {
        this.loadTrash(); // Reload the list, restored items will disappear from trash
      },
      error: (err) => console.error('Failed to restore items', err),
    });
  }

  deletePermanentlySelected() {
    if (this.selectedItems.size === 0) return;

    if (
      confirm(
        `Are you sure you want to permanently delete these ${this.selectedItems.size} items? This cannot be undone.`,
      )
    ) {
      const payload = this.getSelectedPayload();
      this.trashService.permanentlyDeleteItems(payload).subscribe({
        next: () => {
          this.loadTrash();
        },
        error: (err) => console.error('Failed to permanently delete items', err),
      });
    }
  }
}
