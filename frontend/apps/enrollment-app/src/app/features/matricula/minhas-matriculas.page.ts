import { Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatriculaStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-minhas-matriculas',
  standalone: true,
  imports: [
    TableModule,
    Button,
    Tag,
    Card,
    Toast,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <p-card header="Minhas Matrículas">
      <unifor-error-message [message]="store.error()" />

      @if (store.loading()) {
        <unifor-loading />
      } @else {
        <p-table
          [value]="store.minhasMatriculas()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="Você ainda não possui matrículas."
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="aulaMatriz.disciplina.nome">
                Disciplina <p-sortIcon field="aulaMatriz.disciplina.nome" />
              </th>
              <th pSortableColumn="aulaMatriz.professor.nome">
                Professor <p-sortIcon field="aulaMatriz.professor.nome" />
              </th>
              <th>Dia / Horário</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-matricula>
            <tr>
              <td>
                <div class="cell-primary">
                  {{ matricula.aulaMatriz.disciplina.nome }}
                </div>
                <div class="cell-secondary">
                  {{ matricula.aulaMatriz.disciplina.cargaHoraria }}h
                </div>
              </td>
              <td>{{ matricula.aulaMatriz.professor.nome }}</td>
              <td>
                <div class="cell-primary">
                  {{ matricula.aulaMatriz.horario.diaSemana }}
                </div>
                <div class="cell-secondary">
                  {{ matricula.aulaMatriz.horario.horaInicio }} –
                  {{ matricula.aulaMatriz.horario.horaFim }}
                </div>
              </td>
              <td>
                <p-tag
                  [value]="matricula.aulaMatriz.horario.periodo"
                  [severity]="getPeriodoSeverity(matricula.aulaMatriz.horario.periodo)"
                />
              </td>
              <td>
                <p-button
                  icon="pi pi-times"
                  label="Cancelar"
                  severity="danger"
                  size="small"
                  (onClick)="store.cancelarMatricula(matricula.id)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </p-card>
  `,
  styles: [
    `
      .cell-primary {
        font-weight: 500;
      }

      .cell-secondary {
        font-size: 0.82rem;
        color: #6b7280;
        margin-top: 2px;
      }
    `,
  ],
})
export class MinhasMatriculasPage implements OnInit {
  readonly store = inject(MatriculaStore);

  ngOnInit(): void {
    this.store.loadMinhasMatriculas();
  }

  getPeriodoSeverity(periodo: string): 'success' | 'info' | 'warning' {
    const map: Record<string, 'success' | 'info' | 'warning'> = {
      MANHA: 'success',
      TARDE: 'info',
      NOITE: 'warning',
    };
    return map[periodo] ?? 'info';
  }
}
