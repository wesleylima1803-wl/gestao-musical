import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';
import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  private formBuilder = inject(FormBuilder).nonNullable;
  private authService = inject(AuthService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);

  carregando = false;

  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  entrar(): void {
    if (this.form.invalid || this.carregando) {
      return;
    }

    this.carregando = true;

    const email = this.form.controls.email.value;
    const senha = this.form.controls.senha.value;

    this.authService.login(email, senha)
      .pipe(
        finalize(() => {
          this.carregando = false;
        }),
      )

      .subscribe({
        next: usuario => {
          this.notificacao.sucesso(`Bem-vindo(a), ${usuario.nomeCompleto}!`);

          if (usuario.perfil === 'ADMINISTRADOR') {
            this.router.navigate(['/admin/painel-recentes']);
          } else {
            this.router.navigate(['/consumidor/catalogo-bandas']);
          }
        },

        error: erro => {
          this.notificacao.erro(erro.message || 'Login inválido.');
        }
      });
  }
}
