import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AlbumComBanda, CatalogoService } from '../../../services/catalogo.service';
import { DuracaoPipe } from '../../../shared/pipes/formatar-duracao.pipe';

@Component({
  selector: 'app-catalogo-albuns',
  standalone: true,
  imports: [
    AsyncPipe,
    DuracaoPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './catalogo-albuns.component.html',
  styleUrl: './catalogo-albuns.component.scss'
})
export class CatalogoAlbunsComponent implements OnInit {
  private catalogoService = inject(CatalogoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  carregando$ = this.catalogoService.carregando$;
  albuns$ = this.catalogoService.albuns$;


  albumSelecionado$ = combineLatest([
    this.catalogoService.albuns$,
    this.route.paramMap
  ]).pipe(
    map(([albuns, params]): AlbumComBanda | null => {
      const albumId = params.get('albumId');
      if (!albumId) {
        return null;
      }

      const album = albuns.find(a => a.id === albumId);
      if (!album) {
        return null;
      }

      return {
        ...album,
        musicas: [...album.musicas].sort((a, b) => a.numeroFaixa - b.numeroFaixa)
      };
    })
  );

  ngOnInit(): void {
    this.catalogoService
      .getAllBandas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getAlbum(albumId: string): void {
    this.router.navigate(['/consumidor/albuns', albumId]);
  }

  getAllAlbums(): void {
    this.router.navigate(['/consumidor/albuns']);
  }

  getBanda(bandaId: string): void {
    this.router.navigate(['/consumidor/bandas', bandaId]);
  }
}
