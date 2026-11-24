import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatarDuracao',
  standalone: true
})
export class FormatarDuracaoPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
