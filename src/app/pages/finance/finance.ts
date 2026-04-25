import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
})
export class Finance implements OnInit {
  clients: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/Clients`).subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load clients', err);
        this.isLoading = false;
      },
    });
  }

  // When a user clicks a client card, we navigate to their specific finance page.
  openClientFinance(clientId: number) {
    this.router.navigate(['/finance', clientId]);
  }

  // Helper to generate those nice colorful initials if the client lacks a logo
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
