import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { LoginComponent } from '../auth/login.component';
import { UserBrowserComponent } from '../user-browser/user-browser.component';

export const appRoutes: Routes = [
  // Default entry redirects to login.
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  // Public login page.
  {
    path: 'login',
    component: LoginComponent,
  },
  // Protected application area.
  {
    path: 'app',
    component: UserBrowserComponent,
    canActivate: [authGuard],
  },
  // Fallback for unknown routes.
  {
    path: '**',
    redirectTo: 'login',
  },
];
