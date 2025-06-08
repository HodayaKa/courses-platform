import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withDebugTracing, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './features/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withDebugTracing(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};