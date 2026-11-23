import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, map, timer} from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })

export class AuthService {
  private readonly usuariosLista: Usuario[] = [
    { id: 'u-1',
      nomeCompleto: 'Administrador',
      email: 'admin@musica.com',
      senha: '123',
      perfil: 'ADMINISTRADOR'
    },
    { id: 'u-2', nomeCompleto: 'Usuário Comum',
      email: 'user@musica.com',
      senha: '123',
      perfil: 'COMUM'
    }
  ];

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioLogado$ = this.usuarioSubject.asObservable();

  login(email: string, senha: string): Observable<Usuario> {
    return timer(600).pipe(
      map(() => {
        const usuario = this.usuariosLista.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
        );

        if (!usuario) {
          throw new Error('Login inválido.');
        }

        this.usuarioSubject.next(usuario);
        return usuario;
      })
    );
  }

  logout(): void {
    this.usuarioSubject.next(null);
  }

  estaAutenticado(): boolean {
    return !!this.usuarioSubject.value;
  }

  ehAdmin(): boolean {
    return this.usuarioSubject.value?.perfil === 'ADMINISTRADOR';
  }
}
