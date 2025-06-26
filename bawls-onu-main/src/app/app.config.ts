import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { IMAGE_CONFIG } from '@angular/common';
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      }
    },
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withViewTransitions()), 
    provideAnimations(),
    provideAnimationsAsync(),
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 1000,
      // progressBar: true,
      closeButton: true,
      preventDuplicates: true,
      toastClass: 'ngx-toastr custom-toast',
    }),
  ]
};