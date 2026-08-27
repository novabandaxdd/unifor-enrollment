import { Component, OnInit, inject, effect } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatriculaStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-aulas-disponiveis',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    ToastModule,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <p-card header="Aulas Disponíveis">
      @if (store.loading()) {
        <unifor-loading />
      } @else {
        <p-table
          [value]="store.aulasDisponiveis()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          stripedRows="true"
          responsiveLayout="scroll"
          emptyMessage="Nenhuma aula disponível para o seu curso."
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="disciplina.nome">
                Disciplina <p-sortIcon field="disciplina.nome" />
              </th>
              <th pSortableColumn="professor.nome">
                Professor <p-sortIcon field="professor.nome" />
              </th>
              <th>Dia / Horário</th>
              <th>Período</th>
              <th pSortableColumn="vagasDisponiveis">
                Vagas <p-sortIcon field="vagasDisponiveis" />
              </th>
              <th>Ação</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-aula>
            <tr>
              <td>
                <div class="cell-primary">{{ aula.disciplina.nome }}</div>
                <div class="cell-secondary">
                  {{ aula.disciplina.cargaHoraria }}h
                </div>
              </td>
              <td>{{ aula.professor.nome }}</td>
              <td>
                <div class="cell-primary">{{ aula.horario.diaSemana }}</div>
                <div class="cell-secondary">
                  {{ aula.horario.horaInicio }} – {{ aula.horario.horaFim }}
                </div>
              </td>
              <td>
                <p-tag
                  [value]="aula.horario.periodo"
                  [severity]="getPeriodoSeverity(aula.horario.periodo)"
                />
              </td>
              <td>
                <p-tag
                  [value]="aula.vagasDisponiveis + ' / ' + aula.maxAlunos"
                  [severity]="aula.vagasDisponiveis > 0 ? 'success' : 'danger'"
                />
              </td>
              <td>
                <p-button
                  icon="pi pi-check"
                  label="Matricular"
                  severity="success"
                  size="small"
                  [disabled]="aula.vagasDisponiveis === 0 || store.loading()"
                  (onClick)="store.matricular(aula.id)"
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
export class AulasDisponiveisPage implements OnInit {
  readonly store = inject(MatriculaStore);
  private messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const success = this.store.successMessage();
      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: success,
        });
        this.store.clearMessages();
      }
    });

    effect(() => {
      const error = this.store.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error,
        });
        this.store.clearMessages();
      }
    });
  }

  ngOnInit(): void {
    this.store.loadAulasDisponiveis();
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
