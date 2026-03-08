import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ModernNotificationService } from '../components/notification/notification.service';

type ApiErrorPayload = {
  code?: string;
  errorCode?: string;
  message?: string;
  description?: string;
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const notification = inject(ModernNotificationService);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      const rawPayload =
        typeof error.error === 'object' && error.error !== null
          ? error.error
          : { message: error.error };

      const payload = rawPayload as ApiErrorPayload;

      const message =
        payload.message ??
        payload.description ??
        error.message ??
        'Erro inesperado.';

      notification.toast.error(message);

      console.error('[HTTP ERROR]', {
        url: req.url,
        method: req.method,
        error
      });

      return throwError(() => error);
    })

  );
};