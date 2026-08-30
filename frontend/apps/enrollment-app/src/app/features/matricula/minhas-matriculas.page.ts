import { Component, OnInit, inject, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
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
    RouterLink,
    TableModule,
    Button,
    Tag,
    Toast,
    ConfirmDialog,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right" />
    <p-confirmDialog />

    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Minhas Matriculas</h1>
          <p class="page-subtitle">Todas as aulas em que voce esta matriculado</p>
        </div>
        @if (store.minhasMatriculas().length > 0) {
          <div class="count-badge">
            <i class="pi pi-bookmark-fill"></i>
            {{ store.minhasMatriculas().length }} matricula{{ store.minhasMatriculas().length !== 1 ? 's' : '' }}
          </div>
        }
      </div>

      <unifor-error-message [message]="store.error()" />

      @if (store.loading()) {
        <div class="loading-state"><unifor-loading /></div>
      } @else if (store.minhasMatriculas().length === 0) {

        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i class="pi pi-inbox"></i>
          </div>
          <h3>Nenhuma matricula ainda</h3>
          <p>Voce ainda nao esta matriculado em nenhuma aula.<br>Acesse "Aulas Disponiveis" para se matricular.</p>
          <p-button
            label="Ver Aulas Disponiveis"
            icon="pi pi-search"
            severity="secondary"
            routerLink="/matricula/disponiveis"
          />
        </div>

      } @else {

        <div class="content-card">
          <p-table
            [value]="store.minhasMatriculas()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 20]"
            stripedRows
            responsiveLayout="scroll"
            styleClass="unifor-table"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="aulaMatriz.disciplina.nome" class="col-disciplina">
                  Disciplina <p-sortIcon field="aulaMatriz.disciplina.nome" />
                </th>
                <th pSortableColumn="aulaMatriz.professor.nome" class="col-professor">
                  Professor <p-sortIcon field="aulaMatriz.professor.nome" />
                </th>
                <th class="col-horario">Horario</th>
                <th class="col-periodo">Periodo</th>
                <th class="col-data">Matriculado em</th>
                <th class="col-acao">Acao</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-matricula>
              <tr class="table-row">
                <td>
                  <div class="discipline-name">{{ matricula.aulaMatriz.disciplina.nome }}</div>
                  <div class="discipline-hours">
                    <i class="pi pi-clock" style="font-size:0.7rem"></i>
                    {{ matricula.aulaMatriz.disciplina.cargaHoraria }}h
                  </div>
                </td>

                <td>
                  <div class="professor-info">
                    <i class="pi pi-user professor-icon"></i>
                    {{ matricula.aulaMatriz.professor.nome }}
                  </div>
                </td>

                <td>
                  <div class="schedule-day">{{ getDiaSemanaLabel(matricula.aulaMatriz.horario.diaSemana) }}</div>
                  <div class="schedule-time">
                    {{ matricula.aulaMatriz.horario.horaInicio.substring(0, 5) }} - {{ matricula.aulaMatriz.horario.horaFim.substring(0, 5) }}
                  </div>
                </td>

                <td>
                  <p-tag
                    [value]="getPeriodoLabel(matricula.aulaMatriz.horario.periodo)"
                    [severity]="getPeriodoSeverity(matricula.aulaMatriz.horario.periodo)"
                    [rounded]="true"
                  />
                </td>

                <td>
                  <div class="date-cell">
                    {{ matricula.dataMatricula | date:'dd/MM/yyyy' }}
                    <span class="date-time">{{ matricula.dataMatricula | date:'HH:mm' }}</span>
                  </div>
                </td>

                <td>
                  <p-button
                    icon="pi pi-times"
                    label="Cancelar"
                    severity="danger"
                    size="small"
                    [outlined]="true"
                    styleClass="btn-cancelar"
                    (onClick)="confirmarCancelamento(matricula)"
                  />
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 0.5rem;
    }
    .page-title { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 0.88rem; color: #6b7280; margin: 0.25rem 0 0; }

    .count-badge {
      display: flex; align-items: center; gap: 0.4rem;
      background: #eff6ff; color: #1d4ed8;
      border-radius: 99px; padding: 0.35rem 0.9rem;
      font-size: 0.85rem; font-weight: 600;
    }

    .content-card {
      background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
    }

    .loading-state { padding: 3rem; display: flex; justify-content: center; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 5rem 2rem; text-align: center;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px; background: #f3f4f6;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .empty-icon-wrap .pi { font-size: 2rem; color: #9ca3af; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 600; color: #374151; margin: 0; }
    .empty-state p { font-size: 0.88rem; color: #9ca3af; margin: 0; line-height: 1.6; }

    :host ::ng-deep .unifor-table .p-datatable-thead > tr > th {
      background: #f9fafb; color: #374151; font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb; padding: 0.85rem 1rem;
    }
    :host ::ng-deep .unifor-table .p-datatable-tbody > tr > td { padding: 0.85rem 1rem; vertical-align: middle; }
    :host ::ng-deep .unifor-table .p-datatable-tbody > tr:hover > td { background: #fef2f2; }

    .col-disciplina { width: 25%; }
    .col-professor { width: 20%; }
    .col-horario { width: 15%; }
    .col-periodo { width: 10%; }
    .col-data { width: 15%; }
    .col-acao { width: 15%; }

    .discipline-name { font-size: 0.9rem; font-weight: 600; color: #111827; }
    .discipline-hours { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

    .professor-info { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; color: #374151; }
    .professor-icon { font-size: 0.8rem; color: #9ca3af; }

    .schedule-day { font-size: 0.88rem; font-weight: 600; color: #374151; }
    .schedule-time { font-size: 0.8rem; color: #6b7280; font-family: 'Consolas', monospace; margin-top: 2px; }

    .date-cell { font-size: 0.88rem; font-weight: 500; color: #374151; display: flex; flex-direction: column; gap: 2px; }
    .date-time { font-size: 0.75rem; color: #9ca3af; font-family: 'Consolas', monospace; }

    :host ::ng-deep .btn-cancelar .p-button { font-size: 0.82rem; }
  `],
})
export class MinhasMatriculasPage implements OnInit {
  readonly store = inject(MatriculaStore);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      const success = this.store.successMessage();
      if (success) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: success, life: 3000 });
        this.store.clearMessages();
      }
    });
  }

  ngOnInit(): void {
    this.store.loadMinhasMatriculas();
  }

  confirmarCancelamento(matricula: { id: string; aulaMatriz: { disciplina: { nome: string } } }): void {
    this.confirmationService.confirm({
      message: `Deseja cancelar a matricula em <strong>${matricula.aulaMatriz.disciplina.nome}</strong>?`,
      header: 'Cancelar Matricula',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Sim, cancelar',
      rejectLabel: 'Nao',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.cancelarMatricula(matricula.id);
        this.messageService.add({
          severity: 'info', summary: 'Cancelada',
          detail: `Matricula em "${matricula.aulaMatriz.disciplina.nome}" cancelada.`,
          life: 3000,
        });
      },
    });
  }

  getDiaSemanaLabel(dia: string): string {
    const map: Record<string, string> = {
      SEG: 'Segunda', TER: 'Terca', QUA: 'Quarta',
      QUI: 'Quinta', SEX: 'Sexta', SAB: 'Sabado', DOM: 'Domingo',
    };
    return map[dia] ?? dia;
  }

  getPeriodoLabel(periodo: string): string {
    return { MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' }[periodo] ?? periodo;
  }

  getPeriodoSeverity(periodo: string): 'success' | 'info' | 'warn' {
    return { MANHA: 'success' as const, TARDE: 'info' as const, NOITE: 'warn' as const }[periodo] ?? 'info';
  }
}
