import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { config } from '../config';

const PUBLIC_ROUTES = [
  { path: '/users/login', method: 'POST' },
  { path: '/users', method: 'POST' },
  { path: '/complaints', method: 'GET' },
  { path: '/petitions', method: 'GET' },
  { path: '/complaints/complaint/', method: 'GET' },
  { path: '/petitions/', method: 'GET' },
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getTokenFromStorage();

  // Se não for uma rota da API do sistema, não mexe
  if (!req.url.startsWith(config.api)) {
    return next(req);
  }

  // Verifica se a rota é pública
  const isPublic = PUBLIC_ROUTES.some(route => 
    req.url.includes(route.path) && 
    req.method === route.method &&
    // Especial para não ignorar a rota de "minhas petições" que tem caminho similar
    !(route.path === '/petitions/' && req.url.includes('/petitions/petitions/mine'))
  );

  if (token && !isPublic) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
