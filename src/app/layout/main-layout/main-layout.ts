import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  // We use a simple index now (0 = Dashboard, 1 = Products, etc.)
  activeIndex: number = 0;

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.movePill(this.router.url);
    });
  }

  ngOnInit() {
    this.movePill(this.router.url);
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
    } else {
      this.activeIndex = 0; // Dashboard
    }
  }
}
