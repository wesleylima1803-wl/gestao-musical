import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacaoService } from '../services/notificacao.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacao = inject(NotificacaoService);

  if (authService.estaAutenticado()) {
    return true;
  }

  notificacao.erro('Você precisa fazer login para acessar esta página.');
  router.navigate(['/login']);
  return false; // Obrigatório para cancelar a rota original
};
