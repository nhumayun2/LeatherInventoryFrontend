import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  stats: any = null;
  loading: boolean = true;
  error: string | null = null;

  totalInventory: number = 0;
  readyPercent: number = 0;
  inProductionPercent: number = 0;

  // 🌟 Make sure static is false so it checks after *ngIf resolves
  @ViewChild('activityChart', { static: false }) activityChart!: ElementRef;
  chartInstance: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  ngAfterViewInit() {
    // Attempt to render if data was somehow already loaded
    this.tryRenderChart();
  }

  loadDashboardStats() {
    this.loading = true;

    this.http.get(`${environment.apiUrl}/Dashboard/stats`).subscribe({
      next: (data) => {
        console.log('Dashboard stats loaded:', data);
        this.stats = data;
        
        this.calculateInventoryPercentages();
        
        this.loading = false;

        // 🌟 Give Angular a tiny delay to remove the loading spinner and insert the canvas
        setTimeout(() => {
          this.tryRenderChart();
        }, 150); 
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.error = 'Failed to load dashboard statistics. Please check your connection.';
        this.loading = false;
      },
    });
  }

  calculateInventoryPercentages() {
    // Handle both camelCase and PascalCase just in case
    const inv = this.stats.factoryInventory || this.stats.FactoryInventory;
    if (!inv) return;
    
    this.totalInventory = (inv.ready || 0) + (inv.inProduction || 0);

    if (this.totalInventory > 0) {
      this.readyPercent = Math.round(((inv.ready || 0) / this.totalInventory) * 100);
      this.inProductionPercent = Math.round(((inv.inProduction || 0) / this.totalInventory) * 100);
    }
  }

  tryRenderChart() {
    // Safely grab the data regardless of C# serialization casing
    const activityData = this.stats?.orderActivity || this.stats?.OrderActivity;
    
    if (!activityData) {
      console.warn('Chart render aborted: No activity data found in API response.');
      return;
    }

    if (!this.activityChart) {
      console.warn('Chart render aborted: Canvas element not yet in DOM.');
      // Try one more time in case the DOM is just being slow
      setTimeout(() => {
        if (this.activityChart) this.renderChart(activityData);
      }, 200);
      return;
    }

    this.renderChart(activityData);
  }

  renderChart(activityData: any[]) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.activityChart.nativeElement.getContext('2d');
    
    // 🌟 Safely handle properties whether they are 'month' or 'Month'
    const labels = activityData.map(d => d.month || d.Month || '');
    const dataPoints = activityData.map(d => d.count || d.Count || 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'rgba(217, 119, 67, 0.4)'); // cinnamon color
    gradient.addColorStop(1, 'rgba(217, 119, 67, 0)');

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Orders',
          data: dataPoints,
          borderColor: '#d97743',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(69, 42, 27, 0.9)',
            titleFont: { size: 11 },
            bodyFont: { size: 13, weight: 'bold' },
            displayColors: false,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { 
              color: 'rgba(255,255,255,0.4)',
              font: { size: 10, weight: 'bold' }
            },
            border: { display: false }
          },
          y: {
            display: false,
            min: 0
          }
        }
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  }
}