import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duracao',
  standalone: true
})

export class DuracaoPipe implements PipeTransform {
  transform(segundos: number | null | undefined): string {
    if (segundos == null || Number.isNaN(segundos) || segundos < 0) {
      return '00:00';
    }

    const totalSegundos = Math.floor(segundos);
    const minutos = Math.floor(totalSegundos / 60);
    const restoSegundos = totalSegundos % 60;

    const minutosFormatados = String(minutos).padStart(2, '0');
    const segundosFormatados = String(restoSegundos).padStart(2, '0');

    return `${minutosFormatados}:${segundosFormatados}`;
  }
}
