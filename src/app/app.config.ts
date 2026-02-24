import 'zone.js'; // 1. THE HEARTBEAT: Force Angular's change detector to load so the app doesn't crash.
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // 2. THE DELIVERY GUY: We import the tool that allows API calls.

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    
    // 3. ACTIVATE THE DELIVERY GUY: We add it to the providers list so the whole app can use it.
    provideHttpClient() 
  ]
};