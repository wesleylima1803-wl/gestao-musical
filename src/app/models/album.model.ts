import { Musica } from './musica.model';

export type TipoAlbum = 'COMPLETO' | 'SINGLE';

export interface Album {
  id: string;
  bandaId: string;
  titulo: string;
  anoLancamento: number;
  tipo: TipoAlbum;
  imagemCapaUrl: string;
  musicas: Musica[];
}
