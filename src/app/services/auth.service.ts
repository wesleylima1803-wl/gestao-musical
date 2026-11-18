import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { Usuario } from "../models/usuario.model";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, tap, throwError } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuariosMock: Usuario[] = [
    {
      id: 'u-1',
      nomeCompleto: 'Administrador do Catálogo',
      email: 'admin@musica.com',
      senha: '123',
      perfil: 'ADMINISTRADOR'
    },
    {
      id: 'u-2',
      nomeCompleto: 'Usuário Consumidor',
      email: 'user@musica.com',
      senha: '123',
      perfil: 'COMUM'
    }
  ];

  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioLogado$ = this.usuarioLogadoSubject.asObservable();

  login(email: string, senha: string): Observable<Usuario> {
    const usuario = this.usuariosMock.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
    );

    if (!usuario) {
      return throwError(() => new Error('Credenciais inválidas.')).pipe(delay(600));
    }

    return of(usuario).pipe(
      delay(600),
      tap(u => this.usuarioLogadoSubject.next(u))
    );
  }

  logout(): void {
    this.usuarioLogadoSubject.next(null);
  }

  get usuarioAtual(): Usuario | null {
    return this.usuarioLogadoSubject.value;
  }

  estaAutenticado(): boolean {
    return this.usuarioLogadoSubject.value !== null;
  }

  ehAdmin(): boolean {
    return this.usuarioLogadoSubject.value?.perfil === 'ADMINISTRADOR';
  }
}
