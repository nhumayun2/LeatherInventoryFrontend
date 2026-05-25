import 'zone.js'; 
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

// 🌟 Import the exact class name 'App' from your app.ts file
import { App } from './app/app'; 

// 🌟 Bootstrap the 'App' class
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));