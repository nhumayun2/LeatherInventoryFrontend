import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../services/client';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  clients: any[] = [];

  newClientName: string = '';
  selectedLogo: File | null = null;

  isSubmitting: boolean = false;

  constructor(private clientService: Client) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      },
    });
  }

  onFileSelected(event: any) {
    // 1. Tell TypeScript explicitly that this event came from an HTML File Input
    const input = event.target as HTMLInputElement;

    // 2. Safely check if the input exists and actually contains files
    if (input && input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      console.log('File selected safely:', this.selectedLogo.name);
    } else {
      // If they clicked "Cancel" in the file window, clear the selection
      this.selectedLogo = null;
    }
  }

  saveClient() {
    if (!this.newClientName.trim()) {
      alert('Please enter a client name.');
      return;
    }

    this.isSubmitting = true;

    this.clientService.createClient(this.newClientName, this.selectedLogo || undefined).subscribe({
      next: (newClientDbRecord) => {
        console.log('Client created successfully:', newClientDbRecord);
        this.clients.push(newClientDbRecord);
        this.newClientName = '';
        this.selectedLogo = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating client:', error);
        alert('An error occurred while creating the client. Please try again.');
        this.isSubmitting = false;
      },
    });
  }
}
