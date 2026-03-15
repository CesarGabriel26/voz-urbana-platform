import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { ModernNotificationService } from '../components/notification/notification.service';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(ModernNotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Handle 401 Unauthorized (Avoid login/refresh loops)
      const isLoginOrRefresh = req.url.includes('/users/login') || req.url.includes('/users/refresh');
      
      if (error.status === 401 && !isLoginOrRefresh) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            if (res) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.accessToken}`
                }
              });
              return next(retryReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // 2. Handle other errors
      const rawPayload =
        typeof error.error === 'object' && error.error !== null
          ? error.error
          : { message: error.error };

      const payload = rawPayload as any;

      const message =
        payload.message ??
        payload.description ??
        error.message ??
        'Erro inesperado.';

      // Don't show toast for 401 as we handled it above (or it's a login/refresh fail)
      if (error.status !== 401) {
        notification.toast.error(message);
      }

      console.error('[HTTP ERROR]', {
        url: req.url,
        method: req.method,
        error
      });

      return throwError(() => error);
    })
  );
};