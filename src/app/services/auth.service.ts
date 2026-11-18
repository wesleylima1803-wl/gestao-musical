import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import {BehaviorSubject, delay, Observable, of, tap, throwError} from "rxjs";
import { Usuario } from "../models/usuario.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuariosMock: Usuario[] = [
    {
      id: '1',
      nomeCompleto: 'Administrador',
      email: 'admin@gmail.com',
      senha: '123',
      perfil: 'ADMINISTRADOR'
    },
    {
      id: '2',
      nomeCompleto: 'Usuário Comum',
      email: 'usuario@gmail.com',
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
