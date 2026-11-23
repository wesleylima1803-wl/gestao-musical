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
  private bandas: Banda[] = [
    {
      id: '1',
      nome: 'ABC',
      generoMusical: 'Rock',
      anoFormacao: 2000,
      paisOrigem: 'Brasil',
      biografia: 'Uma das bandas mais influentes do rock.',
      imagemPromocionalUrl: 'https://picsum.photos/seed/banda1/600/350',
      albuns: [
        {
          id: '1',
          bandaId: '1',
          titulo: 'XYZ',
          anoLancamento: 2026,
          tipo: 'COMPLETO',
          imagemCapaUrl: 'https://picsum.photos/seed/album1/400/400',
          musicas: [
            { id: '1', albumId: '1', titulo: 'FGH', duracaoSegundos: 125, numeroFaixa: 1, explicito: false },
            { id: '2', albumId: '1', titulo: 'HIJ', duracaoSegundos: 218, numeroFaixa: 2, explicito: true }
          ]
        },
        {
          id: '2',
          bandaId: '1',
          titulo: 'Single XYZ',
          anoLancamento: 2002,
          tipo: 'SINGLE',
          imagemCapaUrl: 'https://picsum.photos/seed/album2/400/400',
          musicas: [
            { id: '3', albumId: '2', titulo: 'KLM', duracaoSegundos: 651, numeroFaixa: 1, explicito: true }
          ]
        }
      ]
    },
    {
      id: '2',
      nome: 'NOP',
      generoMusical: 'Pop',
      anoFormacao: 1996,
      paisOrigem: 'Reino Unido',
      biografia: 'Banda britânica famosa por suas composições filosóficas.',
      imagemPromocionalUrl: 'https://picsum.photos/seed/banda2/600/350',
      albuns: [
        {
          id: '3',
          bandaId: '2',
          titulo: 'PQR',
          anoLancamento: 1998,
          tipo: 'COMPLETO',
          imagemCapaUrl: 'https://picsum.photos/seed/album3/400/400',
          musicas: [
            { id: '4', albumId: '3', titulo: '123456', duracaoSegundos: 413, numeroFaixa: 1, explicito: false },
            { id: '5', albumId: '3', titulo: '789', duracaoSegundos: 382, numeroFaixa: 2, explicito: true }
          ]
        }
      ]
    }
  ];

  private bandasSubject = new BehaviorSubject<Banda[]>(this.bandas);
  bandas$ = this.bandasSubject.asObservable();

  private carregandoSubject = new BehaviorSubject<boolean>(false);
  carregando$ = this.carregandoSubject.asObservable();

  private proximoIdBanda = 3;
  private proximoIdAlbum = 4;
  private proximoIdMusica = 6;

  private gerarId(tipo: 'banda' | 'album' | 'musica'): string {
    if (tipo === 'banda') {
      const id = this.proximoIdBanda;
      this.proximoIdBanda++;
      return String(id);
    }

    if (tipo === 'album') {
      const id = this.proximoIdAlbum;
      this.proximoIdAlbum++;
      return String(id);
    }

    const id = this.proximoIdMusica;
    this.proximoIdMusica++;
    return String(id);
  }

  private atualizarTela(): void {
    this.bandasSubject.next([...this.bandas]);
  }

  listarBandas(): Observable<Banda[]> {
    this.carregandoSubject.next(true);

    return timer(500).pipe(
      map(() => [...this.bandas]),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  getBandasSnapshot(): Banda[] {
    return this.bandas;
  }

  getAllAlbuns(): AlbumComBanda[] {
    const resultado: AlbumComBanda[] = [];

    for (const banda of this.bandas) {
      for (const album of banda.albuns) {
        resultado.push({
          ...album,
          bandaNome: banda.nome
        });
      }
    }

    return resultado;
  }

  getAllMusicas(): MusicaComContexto[] {
    const resultado: MusicaComContexto[] = [];

    for (const banda of this.bandas) {
      for (const album of banda.albuns) {
        for (const musica of album.musicas) {
          resultado.push({
            ...musica,
            bandaId: banda.id,
            bandaNome: banda.nome,
            albumTitulo: album.titulo
          });
        }
      }
    }

    return resultado;
  }

  adicionarBanda(novaBanda: Banda): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        novaBanda.id = this.gerarId('banda');
        novaBanda.albuns = [];
        this.bandas.unshift(novaBanda);
        this.atualizarTela();
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  editarBanda(bandaEditada: Banda): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        const banda = this.bandas.find(b => b.id === bandaEditada.id);
        if (banda) {
          banda.nome = bandaEditada.nome;
          banda.generoMusical = bandaEditada.generoMusical;
          banda.anoFormacao = bandaEditada.anoFormacao;
          banda.paisOrigem = bandaEditada.paisOrigem;
          banda.biografia = bandaEditada.biografia;
          banda.imagemPromocionalUrl = bandaEditada.imagemPromocionalUrl;
          this.atualizarTela();
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  excluirBanda(bandaId: string): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        this.bandas = this.bandas.filter(b => b.id !== bandaId);
        this.atualizarTela();
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  adicionarAlbum(novoAlbum: Album): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        const banda = this.bandas.find(b => b.id === novoAlbum.bandaId);
        if (banda) {
          novoAlbum.id = this.gerarId('album');
          novoAlbum.musicas = [];
          banda.albuns.unshift(novoAlbum);
          this.atualizarTela();
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  editarAlbum(albumEditado: Album): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        for (const banda of this.bandas) {
          const album = banda.albuns.find(a => a.id === albumEditado.id);
          if (album) {
            album.titulo = albumEditado.titulo;
            album.anoLancamento = albumEditado.anoLancamento;
            album.tipo = albumEditado.tipo;
            album.imagemCapaUrl = albumEditado.imagemCapaUrl;
            this.atualizarTela();
            return;
          }
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  excluirAlbum(bandaId: string, albumId: string): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        const banda = this.bandas.find(b => b.id === bandaId);
        if (banda) {
          banda.albuns = banda.albuns.filter(a => a.id !== albumId);
          this.atualizarTela();
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  adicionarMusica(novaMusica: Musica): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        for (const banda of this.bandas) {
          const album = banda.albuns.find(a => a.id === novaMusica.albumId);
          if (album) {
            novaMusica.id = this.gerarId('musica');
            album.musicas.push(novaMusica);
            album.musicas.sort((a, b) => a.numeroFaixa - b.numeroFaixa);
            this.atualizarTela();
            return;
          }
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  editarMusica(musicaEditada: Musica): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        for (const banda of this.bandas) {
          for (const album of banda.albuns) {
            const musica = album.musicas.find(m => m.id === musicaEditada.id);
            if (musica) {
              musica.titulo = musicaEditada.titulo;
              musica.duracaoSegundos = musicaEditada.duracaoSegundos;
              musica.numeroFaixa = musicaEditada.numeroFaixa;
              musica.explicito = musicaEditada.explicito;
              album.musicas.sort((a, b) => a.numeroFaixa - b.numeroFaixa);
              this.atualizarTela();
              return;
            }
          }
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }

  excluirMusica(albumId: string, musicaId: string): Observable<void> {
    this.carregandoSubject.next(true);

    return timer(600).pipe(
      map(() => {
        for (const banda of this.bandas) {
          const album = banda.albuns.find(a => a.id === albumId);
          if (album) {
            album.musicas = album.musicas.filter(m => m.id !== musicaId);
            this.atualizarTela();
            return;
          }
        }
      }),
      finalize(() => this.carregandoSubject.next(false))
    );
  }
}
