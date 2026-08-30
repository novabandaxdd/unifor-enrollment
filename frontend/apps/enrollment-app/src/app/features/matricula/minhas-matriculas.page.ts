import { Component, OnInit, inject, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MatriculaStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-minhas-matriculas',
  standalone: true,
  imports: [
    DatePipe,
    TableModule,
    Button,
    Tag,
    Card,
    Toast,
    ConfirmDialog,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right" />
    <p-confirmDialog />

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
              <th>Matriculado em</th>
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
                <div class="cell-secondary">
                  {{ matricula.dataMatricula | date:'dd/MM/yyyy HH:mm' }}
                </div>
              </td>
              <td>
                <p-button
                  icon="pi pi-times"
                  label="Cancelar"
                  severity="danger"
                  size="small"
                  (onClick)="confirmarCancelamento(matricula)"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-state">
                <i class="pi pi-inbox" style="font-size: 2rem; color: #9ca3af;"></i>
                <p>Você ainda não possui matrículas.</p>
                <p class="cell-secondary">Acesse "Aulas Disponíveis" para se matricular.</p>
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

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
      }
    `,
  ],
})
export class MinhasMatriculasPage implements OnInit {
  readonly store = inject(MatriculaStore);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      const success = this.store.successMessage();
      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: success,
          life: 3000,
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
          life: 5000,
        });
        this.store.clearMessages();
      }
    });
  }

  ngOnInit(): void {
    this.store.loadMinhasMatriculas();
  }

  confirmarCancelamento(matricula: {
    id: string;
    aulaMatriz: { disciplina: { nome: string } };
  }): void {
    this.confirmationService.confirm({
      message: `Deseja cancelar a matrícula em "<strong>${matricula.aulaMatriz.disciplina.nome}</strong>"?`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Sim, cancelar',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.cancelarMatricula(matricula.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelada',
          detail: `Matrícula em "${matricula.aulaMatriz.disciplina.nome}" cancelada.`,
          life: 3000,
        });
      },
    });
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
