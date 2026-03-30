import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  // We use a simple index now (0 = Dashboard, 1 = Products, etc., 5 = Trash)
  activeIndex: number = 0;

  // 🌟 NEW: Live Clock and Greeting variables
  currentTime: Date = new Date();
  greeting: string = 'Welcome';
  private timerId: any;

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.movePill(this.router.url);
    });
  }

  ngOnInit() {
    this.movePill(this.router.url);

    // 🌟 NEW: Initialize the clock immediately, then set it to tick every second
    this.updateClock();
    this.timerId = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy() {
    // 🌟 NEW: Always clean up intervals to prevent memory leaks!
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  // 🌟 NEW: Logic to determine the time and the appropriate greeting
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
      this.greeting = 'Working Late'; // A fun touch for the night shift!
    }
  }

  movePill(url: string) {
    if (url.includes('/products')) {
      this.activeIndex = 1;
    } else if (url.includes('/orders')) {
      this.activeIndex = 2;
    } else if (url.includes('/employees')) {
      this.activeIndex = 3;
    } else if (url.includes('/clients')) {
      this.activeIndex = 4;
    } else if (url.includes('/trash')) {
      this.activeIndex = 5;
    } else {
      this.activeIndex = 0;
    }
  }
}
