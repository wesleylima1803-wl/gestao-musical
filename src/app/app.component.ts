import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CatalogoService } from './services/catalogo.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private catalogoService = inject(CatalogoService);
  private router = inject(Router);
  authService = inject(AuthService);

  carregando$ = this.catalogoService.carregando$;

  loginAdmin(): void {
    this.authService.login('admin@email.com', '123456');
    this.router.navigate(['/admin/painel-recentes']);
  }

  loginUsuario(): void {
    this.authService.login('usuario@email.com', '123456');
    this.router.navigate(['/catalogo/bandas']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

}
