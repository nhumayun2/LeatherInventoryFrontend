import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { ProductDesigns } from './pages/product-designs/product-designs';
import { DesignDetails } from './pages/design-details/design-details';
import { Clients } from './pages/clients/clients';
import { Employees } from './pages/employees/employees';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'products/:id',
    component: ProductDesigns,
  },
  {
    path: 'products/:productId/designs/:designId',
    component: DesignDetails,
  },
  {
    path: 'clients',
    component: Clients,
  },
  {
    path: 'employees',
    component: Employees,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
