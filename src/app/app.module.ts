import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';

export const appModule = {
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: httpErrorInterceptor,
            multi: true
        }
    ]
}