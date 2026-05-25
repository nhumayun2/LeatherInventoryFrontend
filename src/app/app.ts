import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

// 🌟 Import your MainLayout from the exact path
import { MainLayout } from './layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  // 🌟 MainLayout MUST be included in this array for the HTML tag to work
  imports: [CommonModule, RouterOutlet, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showNavigation: boolean = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const targetUrl = event.urlAfterRedirects.toLowerCase();
      
      const isAuthPage = targetUrl.includes('/login') || 
                         targetUrl.includes('/forgot-password') || 
                         targetUrl.includes('/reset-password');
                         
      this.showNavigation = !isAuthPage;
    });
  }
}