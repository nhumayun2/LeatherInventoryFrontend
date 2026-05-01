import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Finance as FinanceService } from '../../services/finance';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
})
export class Finance implements OnInit {
  clients: any[] = [];
  isLoading = true;

  // --- Sub-Brand Modal State ---
  isModalOpen = false;
  isSaving = false;
  newSubBrandName = '';

  constructor(
    // 🌟 AND HERE: We use the new alias type
    private financeService: FinanceService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.financeService.getAllFinanceClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load finance clients', err);
        this.isLoading = false;
      },
    });
  }

  openClientFinance(clientId: number) {
    this.router.navigate(['/finance', clientId]);
  }

  // --- Sub-Brand Management ---

  openSubBrandModal() {
    this.newSubBrandName = '';
    this.isModalOpen = true;
  }

  closeSubBrandModal() {
    this.isModalOpen = false;
    this.newSubBrandName = '';
  }

  createSubBrand() {
    if (!this.newSubBrandName.trim()) return;

    this.isSaving = true;
    this.financeService.createSubBrand({ name: this.newSubBrandName }).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeSubBrandModal();
        this.loadClients(); 
      },
      error: (err) => {
        console.error('Failed to create sub-brand', err);
        this.isSaving = false;
        alert('Error creating sub-brand. It might already exist.');
      },
    });
  }

  deleteSubBrand(id: number, event: Event) {
    event.stopPropagation(); 

    if (confirm('Are you sure you want to delete this sub-brand? This only works for Finance-Only clients with no documents.')) {
      this.financeService.deleteSubBrand(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => {
          console.error('Delete failed', err);
          alert('Cannot delete: This might be a main brand or still has active documents.');
        }
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}