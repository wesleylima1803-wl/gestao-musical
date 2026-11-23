import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacaoService } from '../services/notificacao.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacao = inject(NotificacaoService);

  if (!authService.estaAutenticado()) {
    notificacao.erro('Faça login como administrador para acessar esta área.');
    router.navigate(['/login']);
    return false;
  }

  if (authService.ehAdmin()) {
    return true;
  }

  notificacao.erro('Acesso restrito a administradores.');
  router.navigate(['/consumidor/catalogo-bandas']);
  return false;
};
