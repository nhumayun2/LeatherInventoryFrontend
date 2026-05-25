import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the token is preserved in localStorage, let them pass
  if (authService.isLoggedIn()) {
    return true;
  }

  // Otherwise, block access and redirect to the login page
  router.navigate(['/login']);
  return false;
};