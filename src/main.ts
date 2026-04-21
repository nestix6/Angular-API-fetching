import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './components/app-shell/app.component';
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './components/routing/app-routes';

/** Root application providers used for bootstrap. */
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(appRoutes)],
};

/** Bootstraps the standalone root component. */
bootstrapApplication(App, appConfig);
