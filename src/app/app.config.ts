import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimizes change detection tracking cycles
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configures the secure routing table with parameter mapping properties enabled
    provideRouter(routes, withComponentInputBinding()),
    
    // Injecting async animations capabilities for clean layout transitions
    provideAnimationsAsync(),
    
    // 🌟 REGISTER THE AUTH INTERCEPTOR HERE 🌟
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};