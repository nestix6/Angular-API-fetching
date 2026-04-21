import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

/** Allows access only when session user exists; otherwise redirects to login. */
export const authGuard: CanActivateFn = () => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  return appState.currentUser() ? true : router.createUrlTree(['/login']);
};
