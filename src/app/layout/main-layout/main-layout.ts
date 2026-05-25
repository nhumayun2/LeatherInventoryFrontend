import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth'; // 🌟 NEW: Added AuthService

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  activeIndex: number = 0;
  currentTime: Date = new Date();
  greeting: string = 'Welcome';
  private timerId: any;

  isNotificationSidebarOpen: boolean = false;
  notifications: any[] = [];
  unreadCount: number = 0;

  // 🌟 NEW: Toggle state for the profile menu
  isProfileMenuOpen: boolean = false; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService // 🌟 NEW: Injected AuthService
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.movePill(this.router.url);
    });
  }

  ngOnInit() {
    this.movePill(this.router.url);

    this.updateClock();
    this.timerId = setInterval(() => {
      this.updateClock();
    }, 1000);

    this.loadNotifications();
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  loadNotifications() {
    this.http.get<any[]>(`${environment.apiUrl}/Clients`).subscribe({
      next: (clients) => {
        const clientLogos = new Map<string, string>();
        clients.forEach((c) => {
          if (c.logoUrl) {
            clientLogos.set(c.name, c.logoUrl);
          }
        });

        this.http.get<any[]>(`${environment.apiUrl}/Orders`).subscribe({
          next: (orders) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.notifications = orders
              .filter((order) => {
                if (
                  !order.deliveryDate ||
                  order.status === 'Completed' ||
                  order.status === 'Cancelled'
                ) {
                  return false;
                }

                const delDate = new Date(order.deliveryDate);
                const diffTime = delDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 10) {
                  order.daysLeft = diffDays;
                  order.clientLogoUrl = clientLogos.get(order.companyName);
                  return true;
                }
                return false;
              })
              .sort((a, b) => a.daysLeft - b.daysLeft);

            this.unreadCount = this.notifications.length;
          },
          error: (err) => console.error('Failed to load notifications for header', err),
        });
      },
      error: (err) => console.error('Failed to load clients for logos', err),
    });
  }

  toggleNotifications() {
    this.isNotificationSidebarOpen = !this.isNotificationSidebarOpen;
  }

  updateClock() {
    this.currentTime = new Date();
    const hour = this.currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      this.greeting = 'Good Evening';
    } else {
      this.greeting = 'Working Late';
    }
  }

  movePill(url: string) {
    if (url.includes('/products')) {
      this.activeIndex = 1;
    } else if (url.includes('/orders')) {
      this.activeIndex = 2;
    } else if (url.includes('/employees')) {
      this.activeIndex = 3;
    } else if (url.includes('/finance')) {
      this.activeIndex = 4;
    } else if (url.includes('/clients')) {
      this.activeIndex = 5;
    } else if (url.includes('/trash')) {
      this.activeIndex = 6;
    } else {
      this.activeIndex = 0; 
    }
  }

  // 🌟 NEW: Menu Toggle Method
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // 🌟 NEW: Logout Method
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}