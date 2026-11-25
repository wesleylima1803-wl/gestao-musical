import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Banda } from '../../../models/banda.model';
import { Album } from '../../../models/album.model';
import { Musica } from '../../../models/musica.model';
import { CatalogoService } from '../../../services/catalogo.service';
import { NotificacaoService } from '../../../services/notificacao.service';

@Component({
  selector: 'app-central-cadastros',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './central-cadastros.component.html',
  styleUrl: './central-cadastros.component.scss'
})
export class CentralCadastrosComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private catalogoService = inject(CatalogoService);
  private notificacao = inject(NotificacaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bandas$ = this.catalogoService.bandas$;
  carregando$ = this.catalogoService.carregando$;

  albunsDaBandaSelecionada: Album[] = [];

  abaAtual = 0;

  idBandaEdit: string | null = null;
  idAlbumEdit: string | null = null;
  idMusicaEdit: string | null = null;

  bandaForm = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    generoMusical: ['', Validators.required],
    anoFormacao: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    paisOrigem: ['', Validators.required],
    imagemPromocionalUrl: ['', Validators.required],
    biografia: ['', Validators.required]
  });

  albumForm = this.formBuilder.nonNullable.group({
    bandaId: ['', Validators.required],
    titulo: ['', Validators.required],
    anoLancamento: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    tipo: ['COMPLETO' as 'COMPLETO' | 'SINGLE', Validators.required],
    imagemCapaUrl: ['', Validators.required]
  });

  musicaForm = this.formBuilder.nonNullable.group({
    bandaId: ['', Validators.required],
    albumId: [{ value: '', disabled: true }, Validators.required],
    titulo: ['', Validators.required],
    numeroFaixa: [1, [Validators.required, Validators.min(1)]],
    duracaoSegundos: [180, [Validators.required, Validators.min(1)]],
    explicito: [false]
  });

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

  aoSelecionarBandaNaMusica(bandaId: string): void {
    const banda = this.catalogoService.getBandasSnapshot().find(b => b.id === bandaId);
    this.albunsDaBandaSelecionada = banda ? banda.albuns : [];

    this.musicaForm.controls.albumId.setValue('');
    if (this.albunsDaBandaSelecionada.length > 0) {
      this.musicaForm.controls.albumId.enable();
    } else {
      this.musicaForm.controls.albumId.disable();
    }
  }

  private carregarBandaParaEdicao(id: string): void {
    const banda = this.catalogoService.getBandasSnapshot().find(b => b.id === id);
    if (!banda)
      return;

    this.abaAtual = 0;
    this.idBandaEdit = banda.id;
    this.bandaForm.patchValue({
      nome: banda.nome,
      generoMusical: banda.generoMusical,
      anoFormacao: banda.anoFormacao,
      paisOrigem: banda.paisOrigem,
      imagemPromocionalUrl: banda.imagemPromocionalUrl,
      biografia: banda.biografia
    });
  }

  private carregarAlbumParaEdicao(id: string): void {
    const album = this.catalogoService.getAllAlbuns().find(a => a.id === id);
    if (!album)
      return;

    this.abaAtual = 1;
    this.idAlbumEdit = album.id;
    this.albumForm.patchValue({
      bandaId: album.bandaId,
      titulo: album.titulo,
      anoLancamento: album.anoLancamento,
      tipo: album.tipo as 'COMPLETO' | 'SINGLE',
      imagemCapaUrl: album.imagemCapaUrl
    });
    this.albumForm.controls.bandaId.disable();
  }

  private carregarMusicaParaEdicao(id: string): void {
    const musica = this.catalogoService.getAllMusicas().find(m => m.id === id);
    if (!musica)
      return;

    this.abaAtual = 2;
    this.idMusicaEdit = musica.id;

    this.aoSelecionarBandaNaMusica(musica.bandaId);

    this.musicaForm.patchValue({
      bandaId: musica.bandaId,
      albumId: musica.albumId,
      titulo: musica.titulo,
      numeroFaixa: musica.numeroFaixa,
      duracaoSegundos: musica.duracaoSegundos,
      explicito: musica.explicito
    });
    this.musicaForm.controls.bandaId.disable();
    this.musicaForm.controls.albumId.disable();
  }

  salvarBanda(): void {
    if (this.bandaForm.invalid)
      return;

    const dados = this.bandaForm.getRawValue();
    const banda: Banda = {
      id: this.idBandaEdit ?? '',
      ...dados,
      albuns: []
    };

    if (this.idBandaEdit) {
      this.catalogoService.editarBanda(banda).subscribe(() => {
        this.notificacao.sucesso('Banda atualizada com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarBanda(banda).subscribe(() => {
        this.notificacao.sucesso('Banda cadastrada com sucesso!');
        this.bandaForm.reset({ anoFormacao: new Date().getFullYear() });
      });
    }
  }

  salvarAlbum(): void {
    if (this.albumForm.invalid) return;

    const dados = this.albumForm.getRawValue();
    const album: Album = {
      id: this.idAlbumEdit ?? '',
      ...dados,
      musicas: []
    };

    if (this.idAlbumEdit) {
      this.catalogoService.editarAlbum(album).subscribe(() => {
        this.notificacao.sucesso('Álbum atualizado com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarAlbum(album).subscribe(() => {
        this.notificacao.sucesso('Álbum cadastrado com sucesso!');
        this.albumForm.reset({ anoLancamento: new Date().getFullYear(), tipo: 'COMPLETO' });
      });
    }
  }

  salvarMusica(): void {
    if (this.musicaForm.invalid)
      return;

    const dados = this.musicaForm.getRawValue();
    const musica: Musica = {
      id: this.idMusicaEdit ?? '',
      albumId: dados.albumId,
      titulo: dados.titulo,
      numeroFaixa: dados.numeroFaixa,
      duracaoSegundos: dados.duracaoSegundos,
      explicito: dados.explicito
    };

    if (this.idMusicaEdit) {
      this.catalogoService.editarMusica(musica).subscribe(() => {
        this.notificacao.sucesso('Música atualizada com sucesso!');
        this.router.navigate(['/admin/catalogo-geral']);
      });
    } else {
      this.catalogoService.adicionarMusica(musica).subscribe(() => {
        this.notificacao.sucesso('Música cadastrada com sucesso!');
        this.musicaForm.reset({ numeroFaixa: 1, duracaoSegundos: 180, explicito: false });
        this.albunsDaBandaSelecionada = [];
        this.musicaForm.controls.albumId.disable();
      });
    }
  }

  cancelarEdicao(): void {
    this.router.navigate(['/admin/catalogo-geral']);
  }
}
