import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Banda } from '../../../models/banda.model';
import {
  AlbumComBanda,
  CatalogoService,
  MusicaComContexto
} from '../../../services/catalogo.service';
import { NotificacaoService } from '../../../services/notificacao.service';
import { DeleteConfirmacaoComponent } from '../../../shared/components/delete-confirmacao/delete-confirmacao.component';

@Component({
  selector: 'app-catalogo-geral',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './catalogo-geral.component.html',
  styleUrl: './catalogo-geral.component.scss'
})
export class CatalogoGeralComponent {
  private catalogoService = inject(CatalogoService);
  private notificacao = inject(NotificacaoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  bandas$ = this.catalogoService.bandas$;
  albuns$ = this.catalogoService.albuns$;
  musicas$ = this.catalogoService.musicas$;

  editarBanda(bandaId: string): void {
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo: 'banda', id: bandaId }
    });
  }

  editarAlbum(albumId: string): void {
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo: 'album', id: albumId }
    });
  }

  editarMusica(musicaId: string): void {
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

    dialogRef.afterClosed().subscribe(exclusaoConfirmada => {
      if (!exclusaoConfirmada)
        return;

      this.catalogoService.excluirBanda(banda.id).subscribe(() => {
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

    dialogRef.afterClosed().subscribe(exclusaoConfirmada => {
      if (!exclusaoConfirmada)
        return;

      this.catalogoService.excluirAlbum(album.bandaId, album.id).subscribe(() => {
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

    dialogRef.afterClosed().subscribe(exclusaoConfirmada => {
      if (!exclusaoConfirmada)
        return;

      this.catalogoService.excluirMusica(musica.albumId, musica.id).subscribe(() => {
        this.notificacao.sucesso('Música excluída com sucesso!');
      });
    });
  }
}
