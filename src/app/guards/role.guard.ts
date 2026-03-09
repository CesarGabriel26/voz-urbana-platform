import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();
  const requiredRole = route.data['role'];

  if (!role) {
    router.navigate(['/login']);
    return false;
  }

  console.log(role);
  
  if (role.toLowerCase() === requiredRole.toLowerCase()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};