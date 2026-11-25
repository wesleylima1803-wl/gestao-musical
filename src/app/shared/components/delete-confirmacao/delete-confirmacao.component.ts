import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteConfirmacao {
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-raised-button color="warn" (click)="dialogRef.close(true)">Excluir</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmacaoComponent {
  data = inject<DeleteConfirmacao>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<DeleteConfirmacaoComponent>);
}
