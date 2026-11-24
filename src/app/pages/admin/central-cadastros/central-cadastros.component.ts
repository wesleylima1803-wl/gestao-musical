import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Banda } from '../../../models/banda.model';
import { Album } from '../../../models/album.model';
import { Musica } from '../../../models/musica.model';
import { CatalogoService } from '../../../services/catalogo.service';
import { NotificacaoService } from '../../../services/notificacao.service';
import { AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-central-cadastros',
  standalone: true,
  imports: [
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe
  ],
  templateUrl: './central-cadastros.component.html',
  styleUrl: './central-cadastros.component.scss'
})
export class CentralCadastrosComponent implements OnInit {
  private catalogoService = inject(CatalogoService);
  private notificacao = inject(NotificacaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bandas$ = this.catalogoService.bandas$;
  albuns$ = this.catalogoService.albuns$;

  abaAtual = 0;

  editandoBanda = false;
  editandoAlbum = false;
  editandoMusica = false;

  bandaForm: Banda = this.bandaVazia();
  albumForm: Album = this.albumVazio();
  musicaForm: Musica = this.musicaVazia();

  ngOnInit(): void {
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    const id = this.route.snapshot.queryParamMap.get('id');

    if (tipo === 'banda' && id) {
      this.carregarBandaParaEdicao(id);
    } else if (tipo === 'album' && id) {
      this.carregarAlbumParaEdicao(id);
    } else if (tipo === 'musica' && id) {
      this.carregarMusicaParaEdicao(id);
    }
  }

  private carregarBandaParaEdicao(id: string): void {
    const banda = this.catalogoService.getBandasSnapshot().find(b => b.id === id);
    if (!banda)
      return;

    this.abaAtual = 0;
    this.editandoBanda = true;
    this.bandaForm = { ...banda };
  }

  private carregarAlbumParaEdicao(id: string): void {
    const album = this.catalogoService.getAllAlbuns().find(a => a.id === id);
    if (!album) return;

    this.abaAtual = 1;
    this.editandoAlbum = true;
    this.albumForm = {
      id: album.id,
      bandaId: album.bandaId,
      titulo: album.titulo,
      anoLancamento: album.anoLancamento,
      tipo: album.tipo,
      imagemCapaUrl: album.imagemCapaUrl,
      musicas: album.musicas
    };
  }

  private carregarMusicaParaEdicao(id: string): void {
    const musica = this.catalogoService.getAllMusicas()
      .find(m => m.id === id);
    if (!musica) return;

    this.abaAtual = 2;
    this.editandoMusica = true;
    this.musicaForm = {
      id: musica.id,
      albumId: musica.albumId,
      titulo: musica.titulo,
      duracaoSegundos: musica.duracaoSegundos,
      numeroFaixa: musica.numeroFaixa,
      explicito: musica.explicito
    };
  }

  salvarBanda(): void {
    if (this.editandoBanda) {
      this.catalogoService.editarBanda({ ...this.bandaForm }).subscribe(() => {
        this.notificacao.sucesso('Banda editada com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarBanda({ ...this.bandaForm }).subscribe(() => {
        this.notificacao.sucesso('Banda cadastrada com sucesso!');
        this.bandaForm = this.bandaVazia();
      });
    }
  }

  salvarAlbum(): void {
    if (this.editandoAlbum) {
      this.catalogoService.editarAlbum({ ...this.albumForm }).subscribe(() => {
        this.notificacao.sucesso('Álbum editado com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarAlbum({ ...this.albumForm }).subscribe(() => {
        this.notificacao.sucesso('Álbum cadastrado com sucesso!');
        this.albumForm = this.albumVazio();
      });
    }
  }

  salvarMusica(): void {
    if (this.editandoMusica) {
      this.catalogoService.editarMusica({ ...this.musicaForm }).subscribe(() => {
        this.notificacao.sucesso('Música editada com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarMusica({ ...this.musicaForm }).subscribe(() => {
        this.notificacao.sucesso('Música cadastrada com sucesso!');
        this.musicaForm = this.musicaVazia();
      });
    }
  }

  cancelarEdicao(): void {
    this.router.navigate(['/admin/catalogo-geral']);
  }

  private bandaVazia(): Banda {
    return {
      id: '',
      nome: '',
      generoMusical: '',
      anoFormacao: new Date().getFullYear(),
      paisOrigem: '',
      biografia: '',
      imagemPromocionalUrl: '',
      albuns: []
    };
  }

  private albumVazio(): Album {
    return {
      id: '',
      bandaId: '',
      titulo: '',
      anoLancamento: new Date().getFullYear(),
      tipo: 'COMPLETO',
      imagemCapaUrl: '',
      musicas: []
    };
  }

  private musicaVazia(): Musica {
    return {
      id: '',
      albumId: '',
      titulo: '',
      duracaoSegundos: 180,
      numeroFaixa: 1,
      explicito: false
    };
  }
}
