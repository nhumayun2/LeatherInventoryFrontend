import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

// Public Auth Components
import { Login } from './pages/login/login';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';

// Protected Feature Components
import { Products } from './pages/products/products';
import { ProductDesigns } from './pages/product-designs/product-designs';
import { DesignDetails } from './pages/design-details/design-details';
import { Clients } from './pages/clients/clients';
import { Employees } from './pages/employees/employees';
import { Orders } from './pages/orders/orders';
import { Dashboard } from './pages/dashboard/dashboard';
import { Finance } from './pages/finance/finance';
import { ClientFinance } from './pages/client-finance/client-finance';
import { TrashBin } from './pages/trash/trash';

export const routes: Routes = [
  // --- Public Gates ---
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
  },
  {
    path: 'reset-password',
    component: ResetPassword,
  },

  // --- Secure Protected Inventory App Routes ---
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard],
  },
  {
    path: 'products/:id',
    component: ProductDesigns,
    canActivate: [authGuard],
  },
  {
    path: 'products/:productId/designs/:designId',
    component: DesignDetails,
    canActivate: [authGuard],
  },
  {
    path: 'finance',
    component: Finance,
    canActivate: [authGuard],
  },
  {
    path: 'finance/:id',
    component: ClientFinance,
    canActivate: [authGuard],
  },
  {
    path: 'clients',
    component: Clients,
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    component: Employees,
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    component: Orders,
    canActivate: [authGuard],
  },
  {
    path: 'trash',
    component: TrashBin,
    canActivate: [authGuard],
  },

  // --- Fallback Redirection ---
  {
    path: '**',
    redirectTo: '',
  },
];