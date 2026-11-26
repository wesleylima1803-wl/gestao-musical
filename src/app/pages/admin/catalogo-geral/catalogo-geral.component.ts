import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Banda } from '../../../models/banda.model';

import {
  AlbumComBanda,
  CatalogoService,
  MusicaComContexto
} from '../../../services/catalogo.service'

import { NotificacaoService } from '../../../services/notificacao.service';
import { DeleteConfirmacaoComponent } from '../../../shared/components/delete-confirmacao/delete-confirmacao.component';
import {DuracaoPipe} from "../../../shared/pipes/formatar-duracao.pipe";

@Component({
  selector: 'app-catalogo-geral',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    DuracaoPipe
  ],
  templateUrl: './catalogo-geral.component.html',
  styleUrl: './catalogo-geral.component.scss'
})
export class CatalogoGeralComponent implements OnInit {
  private catalogoService = inject(CatalogoService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  bandas$ = this.catalogoService.bandas$;
  albuns$ = this.catalogoService.albuns$;
  musicas$ = this.catalogoService.musicas$;
  carregando$ = this.catalogoService.carregando$;

  ngOnInit(): void {
    this.catalogoService
      .getAllBandas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  editarBanda(bandaId: string): void {
    if (!bandaId) return;
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo: 'banda', id: bandaId }
    });
  }

  editarAlbum(albumId: string): void {
    if (!albumId) return;
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo: 'album', id: albumId }
    });
  }

  editarMusica(musicaId: string): void {
    if (!musicaId) return;
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo: 'musica', id: musicaId }
    });
  }

  excluirBanda(banda: Banda): void {
    const dialogRef = this.dialog.open(DeleteConfirmacaoComponent, {
      width: '500px',
      data: {
        titulo: 'Excluir',
        mensagem: `Deseja excluir a banda "${banda.nome}" e todos os seus álbuns/músicas?`
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(exclusaoConfirmada => {
        if (!exclusaoConfirmada)
          return;

        this.catalogoService
          .excluirBanda(banda.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.notificacao.sucesso('Banda excluída com sucesso!');
          });
      });
  }

  excluirAlbum(album: AlbumComBanda): void {
    const dialogRef = this.dialog.open(DeleteConfirmacaoComponent, {
      width: '500px',
      data: {
        titulo: 'Excluir',
        mensagem: `Deseja excluir o álbum "${album.titulo}" e todas as suas músicas?`
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(exclusaoConfirmada => {
        if (!exclusaoConfirmada) return;

        this.catalogoService
          .excluirAlbum(album.bandaId, album.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.notificacao.sucesso('Álbum excluído com sucesso!');
          });
      });
  }

  excluirMusica(musica: MusicaComContexto): void {
    const dialogRef = this.dialog.open(DeleteConfirmacaoComponent, {
      width: '500px',
      data: {
        titulo: 'Excluir',
        mensagem: `Deseja excluir a música "${musica.titulo}"?`
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(exclusaoConfirmada => {
        if (!exclusaoConfirmada) return;

        this.catalogoService
          .excluirMusica(musica.albumId, musica.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.notificacao.sucesso('Música excluída com sucesso!');
          });
      });
  }
}
