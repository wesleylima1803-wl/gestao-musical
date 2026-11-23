import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, finalize, map, timer } from 'rxjs';
import { Banda } from '../models/banda.model';
import { Album } from '../models/album.model';
import { Musica } from '../models/musica.model';

export interface AlbumComBanda extends Album {
  bandaNome: string;
}

export interface MusicaComContexto extends Musica {
  bandaId: string;
  bandaNome: string;
  albumTitulo: string;
}

@Injectable({ providedIn: 'root' })

export class CatalogoService {
  private readonly dadosCatalogo: Banda[] = [
    {
      id: 'b-1',
      nome: 'ABC',
      generoMusical: 'Rock',
      anoFormacao: 2000,
      paisOrigem: 'Brasil',
      biografia: 'Uma das bandas mais influentes do rock.',
      imagemPromocionalUrl: 'https://picsum.photos/seed/banda1/600/350', // URL válida de imagem
      albuns: [
        {
          id: 'a-1',
          bandaId: 'b-1',
          titulo: 'XYZ',
          anoLancamento: 2026,
          tipo: 'COMPLETO',
          imagemCapaUrl: 'https://picsum.photos/seed/album1/400/400',
          musicas: [
            {
              id: 'm-1',
              albumId: 'a-1',
              titulo: 'FGH',
              duracaoSegundos: 125,
              numeroFaixa: 1,
              explicito: false
            },
            {
              id: 'm-2',
              albumId: 'a-1',
              titulo: 'HIJ',
              duracaoSegundos: 218,
              numeroFaixa: 2,
              explicito: true
            }
          ]
        },
        {
          id: 'a-2',
          bandaId: 'b-1',
          titulo: 'Single XYZ',
          anoLancamento: 2002,
          tipo: 'SINGLE',
          imagemCapaUrl: 'https://picsum.photos/seed/album2/400/400',
          musicas: [
            {
              id: 'm-3',
              albumId: 'a-2',
              titulo: 'KLM',
              duracaoSegundos: 651,
              numeroFaixa: 1,
              explicito: true
            }
          ]
        }
      ]
    },
    {
      id: 'b-2',
      nome: 'NOP',
      generoMusical: 'Pop',
      anoFormacao: 1996,
      paisOrigem: 'Reino Unido',
      biografia: 'Banda britânica famosa por suas composições filosóficas.',
      imagemPromocionalUrl: 'https://picsum.photos/seed/banda2/600/350',
      albuns: [
        {
          id: 'a-3',
          bandaId: 'b-2',
          titulo: 'PQR',
          anoLancamento: 1998,
          tipo: 'COMPLETO',
          imagemCapaUrl: 'https://picsum.photos/seed/album3/400/400',
          musicas: [
            {
              id: 'm-4',
              albumId: 'a-3',
              titulo: '123456',
              duracaoSegundos: 413,
              numeroFaixa: 1,
              explicito: false
            },
            {
              id: 'm-5',
              albumId: 'a-3',
              titulo: '789',
              duracaoSegundos: 382,
              numeroFaixa: 2,
              explicito: true
            }
          ]
        }
      ]
    }
  ];

  private bandasSubject = new BehaviorSubject<Banda[]>(this.dadosCatalogo);
  private carregandoSubject = new BehaviorSubject<boolean>(false);

  bandas$ = this.bandasSubject.asObservable();
  carregando$ = this.carregandoSubject.asObservable();

  private gerarId(prefixo: string): string {
    return `${prefixo}-${crypto.randomUUID().slice(0, 8)}`;
  }

  private executarComLatencia<T>(acao: () => T, ms = 600): Observable<T> {
    this.carregandoSubject.next(true);
    return timer(ms).pipe(
      map(() => acao()),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  listarBandas(): Observable<Banda[]> {
    return this.executarComLatencia(() => this.bandasSubject.value);
  }

  getBandasSnapshot(): Banda[] {
    return this.bandasSubject.value;
  }

  getAllAlbuns(): AlbumComBanda[] {
    return this.bandasSubject.value.flatMap(banda =>
      banda.albuns.map(album => ({
        ...album,
        bandaNome: banda.nome
      }))
    );
  }

  getAllMusicas(): MusicaComContexto[] {
    return this.bandasSubject.value.flatMap(banda =>
      banda.albuns.flatMap(album =>
        album.musicas.map(musica => ({
          ...musica,
          bandaId: banda.id,
          bandaNome: banda.nome,
          albumTitulo: album.titulo
        }))
      )
    );
  }


  salvarBanda(dados: Omit<Banda, 'id' | 'albuns'>, idEdicao?: string): Observable<Banda> {
    return this.executarComLatencia(() => {
      const lista = [...this.bandasSubject.value];

      if (idEdicao) {
        const i = lista.findIndex(b => b.id === idEdicao);
        if (i >= 0) {
          lista[i] = { ...lista[i], ...dados };
          this.bandasSubject.next(lista);
          return lista[i];
        }
      }

      const nova: Banda = { id: this.gerarId('b'), ...dados, albuns: [] };
      this.bandasSubject.next([nova, ...lista]);
      return nova;
    });
  }

  excluirBanda(bandaId: string): Observable<void> {
    return this.executarComLatencia(() => {
      const filtradas = this.bandasSubject.value.filter(b => b.id !== bandaId);
      this.bandasSubject.next(filtradas);
    });
  }


  salvarAlbum(dados: Omit<Album, 'id' | 'musicas'>, idEdicao?: string): Observable<Album> {
    return this.executarComLatencia(() => {
      let albumSalvo!: Album;

      const lista = this.bandasSubject.value.map(banda => {
        if (idEdicao) {
          const existente = banda.albuns.find(a => a.id === idEdicao);

          if (existente && banda.id === dados.bandaId) {
            albumSalvo = { ...existente, ...dados };
            return {
              ...banda,
              albuns: banda.albuns.map(a => (a.id === idEdicao ? albumSalvo : a))
            };
          }

          if (existente && banda.id !== dados.bandaId) {
            albumSalvo = { ...existente, ...dados };
            return { ...banda, albuns: banda.albuns.filter(a => a.id !== idEdicao) };
          }
        }
        return banda;
      });

      const listaFinal = lista.map(banda => {
        if (banda.id !== dados.bandaId) return banda;

        const jaExiste = idEdicao && banda.albuns.some(a => a.id === idEdicao);
        if (jaExiste) return banda;

        const novoAlbum: Album = albumSalvo ?? {
          id: this.gerarId('a'),
          ...dados,
          musicas: []
        };
        albumSalvo = novoAlbum;

        return { ...banda, albuns: [novoAlbum, ...banda.albuns] };
      });

      this.bandasSubject.next(listaFinal);
      return albumSalvo;
    });
  }

  excluirAlbum(bandaId: string, albumId: string): Observable<void> {
    return this.executarComLatencia(() => {
      const lista = this.bandasSubject.value.map(banda =>
        banda.id === bandaId
          ? { ...banda, albuns: banda.albuns.filter(a => a.id !== albumId) }
          : banda
      );
      this.bandasSubject.next(lista);
    });
  }


  salvarMusica(dados: Omit<Musica, 'id'>, idEdicao?: string): Observable<Musica> {
    return this.executarComLatencia(() => {
      const musicaSalva: Musica = {
        id: idEdicao ?? this.gerarId('m'),
        ...dados
      };

      const lista = this.bandasSubject.value.map(banda => ({
        ...banda,
        albuns: banda.albuns.map(album => {
          const semAntiga = album.musicas.filter(m => m.id !== musicaSalva.id);

          if (album.id === dados.albumId) {
            const ordenadas = [musicaSalva, ...semAntiga].sort(
              (a, b) => a.numeroFaixa - b.numeroFaixa
            );
            return { ...album, musicas: ordenadas };
          }

          return { ...album, musicas: semAntiga };
        })
      }));

      this.bandasSubject.next(lista);
      return musicaSalva;
    });
  }

  excluirMusica(albumId: string, musicaId: string): Observable<void> {
    return this.executarComLatencia(() => {
      const lista = this.bandasSubject.value.map(banda => ({
        ...banda,
        albuns: banda.albuns.map(album =>
          album.id === albumId
            ? { ...album, musicas: album.musicas.filter(m => m.id !== musicaId) }
            : album
        )
      }));

      this.bandasSubject.next(lista);
    });
  }
}
