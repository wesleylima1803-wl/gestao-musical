import { Album } from './album.model';

export interface Banda {
  id: string;
  nome: string;
  generoMusical: string;
  anoFormacao: number;
  paisOrigem: string;
  biografia: string;
  imagemPromocionalUrl: string;
  albuns: Album[];
}
