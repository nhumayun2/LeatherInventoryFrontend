import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../services/client';
import { ClientModal } from '../../components/client-modal/client-modal';

@Component({
  selector: 'app-clients',
  standalone: true,
  // 🌟 THE FIX: ClientModal is now added to this array!
  imports: [CommonModule, FormsModule, ClientModal],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  // Master list from the database
  clients: any[] = [];

  // The list currently shown on screen (after searching)
  filteredClients: any[] = [];

  // UI State for Filters
  searchQuery: string = '';

  // UI State for Modal
  isModalOpen = false;
  selectedClientToEdit: any = null;

  constructor(private clientService: Client) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        // Apply initial filters to populate the table
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  // Runs every time the user types in the search bar
  applyFilters() {
    this.filteredClients = this.clients.filter((client) => {
      const searchStr = this.searchQuery.toLowerCase();
      // Searching only by Name since it's the only text field in your model!
      return client.name && client.name.toLowerCase().includes(searchStr);
    });
  }

  // Helper to extract initials for fallback avatars if they have no LogoUrl
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // --- CRUD Operations ---

  openModal(client?: any) {
    this.selectedClientToEdit = client || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedClientToEdit = null;
  }

  handleSave(payload: FormData) {
    // We expect the modal to emit a FormData object so it can include the Logo image file
    const idString = payload.get('Id') as string;
    const clientId = idString ? parseInt(idString, 10) : 0;

    if (clientId > 0) {
      // Update existing
      this.clientService.updateClient(clientId, payload).subscribe({
        next: () => {
          this.loadClients(); // Reload fresh data to get the new Cloudinary logo URL
          this.closeModal();
        },
        error: (err) => console.error('Failed to update client', err),
      });
    } else {
      // Create new
      this.clientService.createClient(payload).subscribe({
        next: () => {
          this.loadClients(); // Reload fresh data
          this.closeModal();
        },
        error: (err) => console.error('Failed to create client', err),
      });
    }
  }

  deleteClient(id: number) {
    if (confirm('Are you sure you want to permanently delete this client?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.loadClients(); // Reload fresh data
        },
        error: (err) => console.error('Failed to delete client', err),
      });
    }
  }
}
