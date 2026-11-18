export type Perfil = 'ADMINISTRADOR' | 'COMUM';

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  senha?: string;
  perfil: Perfil;
}
