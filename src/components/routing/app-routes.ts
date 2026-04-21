import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { LoginComponent } from '../auth/login.component';
import { UserBrowserComponent } from '../user-browser/user-browser.component';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'app',
    component: UserBrowserComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
