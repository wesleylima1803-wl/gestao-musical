import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { map } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CatalogoService } from '../../../services/catalogo.service';

@Component({
  selector: 'app-painel-recentes',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './painel-recentes.component.html',
  styleUrl: './painel-recentes.component.scss'
})
export class PainelRecentesComponent {
  private catalogoService = inject(CatalogoService);
  private router = inject(Router);

  private readonly qtd_recentes = 5;

  carregando$ = this.catalogoService.carregando$;

  bandasRecentes$ = this.catalogoService.bandas$.pipe(
    map(bandas => [...bandas].reverse().slice(0, this.qtd_recentes))
  );

  albunsRecentes$ = this.catalogoService.albuns$.pipe(
    map(albuns => [...albuns].reverse().slice(0, this.qtd_recentes))
  );

  musicasRecentes$ = this.catalogoService.musicas$.pipe(
    map(musicas => [...musicas].reverse().slice(0, this.qtd_recentes))
  );

  editarItem(tipo: 'banda' | 'album' | 'musica', id: string): void {
    this.router.navigate(['/admin/central-cadastros'], {
      queryParams: { tipo, id }
    });
  }
}
