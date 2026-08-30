import { Component, OnInit, inject, effect } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatriculaStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-aulas-disponiveis',
  standalone: true,
  imports: [
    TableModule,
    Button,
    Tag,
    Toast,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Aulas Disponiveis</h1>
          <p class="page-subtitle">Selecione as aulas do seu curso para se matricular</p>
        </div>
        @if (store.aulasDisponiveis().length > 0) {
          <div class="available-badge">
            <i class="pi pi-check-circle"></i>
            {{ store.aulasDisponiveis().length }} disponivel{{ store.aulasDisponiveis().length !== 1 ? 'is' : '' }}
          </div>
        }
      </div>

      <unifor-error-message [message]="store.error()" />

      @if (store.loading()) {
        <div class="loading-state"><unifor-loading /></div>
      } @else if (store.aulasDisponiveis().length === 0) {

        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i class="pi pi-calendar-times"></i>
          </div>
          <h3>Nenhuma aula disponivel</h3>
          <p>Nao ha aulas disponiveis para o seu curso no momento.<br>Entre em contato com a coordenacao.</p>
        </div>

      } @else {

        <div class="content-card">
          <p-table
            [value]="store.aulasDisponiveis()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 20]"
            stripedRows
            responsiveLayout="scroll"
            styleClass="unifor-table"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="disciplina.nome" class="col-disciplina">
                  Disciplina <p-sortIcon field="disciplina.nome" />
                </th>
                <th pSortableColumn="professor.nome" class="col-professor">
                  Professor <p-sortIcon field="professor.nome" />
                </th>
                <th class="col-horario">Horario</th>
                <th class="col-periodo">Periodo</th>
                <th class="col-vagas">Vagas</th>
                <th class="col-acao">Matricular</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-aula>
              <tr class="table-row" [class.row-esgotado]="aula.vagasDisponiveis === 0">
                <td>
                  <div class="discipline-name">{{ aula.disciplina.nome }}</div>
                  <div class="discipline-hours">
                    <i class="pi pi-clock" style="font-size:0.7rem"></i>
                    {{ aula.disciplina.cargaHoraria }}h
                  </div>
                </td>

                <td>
                  <div class="professor-info">
                    <i class="pi pi-user professor-icon"></i>
                    {{ aula.professor.nome }}
                  </div>
                </td>

                <td>
                  <div class="schedule-day">{{ getDiaSemanaLabel(aula.horario.diaSemana) }}</div>
                  <div class="schedule-time">
                    {{ aula.horario.horaInicio.substring(0, 5) }} - {{ aula.horario.horaFim.substring(0, 5) }}
                  </div>
                </td>

                <td>
                  <p-tag
                    [value]="getPeriodoLabel(aula.horario.periodo)"
                    [severity]="getPeriodoSeverity(aula.horario.periodo)"
                    [rounded]="true"
                  />
                </td>

                <td>
                  <div class="vagas-info">
                    <div class="vagas-bar">
                      <div
                        class="vagas-fill"
                        [style.width.%]="getVagasPercent(aula)"
                        [class.vagas-cheio]="aula.vagasDisponiveis === 0"
                      ></div>
                    </div>
                    <div class="vagas-numbers">
                      @if (aula.vagasDisponiveis === 0) {
                        <span class="vagas-text sem-vagas">Esgotado</span>
                      } @else {
                        <span class="vagas-text">
                          <strong>{{ aula.vagasDisponiveis }}</strong> livres
                        </span>
                        <span class="vagas-total">de {{ aula.maxAlunos }}</span>
                      }
                    </div>
                  </div>
                </td>

                <td>
                  @if (aula.vagasDisponiveis > 0) {
                    <p-button
                      icon="pi pi-user-plus"
                      label="Matricular"
                      size="small"
                      styleClass="btn-matricular"
                      [loading]="store.loading()"
                      (onClick)="store.matricular(aula.id)"
                    />
                  } @else {
                    <span class="esgotado-chip">Sem vagas</span>
                  }
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

    .available-badge {
      display: flex; align-items: center; gap: 0.4rem;
      background: #dcfce7; color: #166534;
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
    :host ::ng-deep .unifor-table .p-datatable-tbody > tr:hover > td { background: #f0fdf4; }
    .row-esgotado td { opacity: 0.55; }

    .col-disciplina { width: 25%; }
    .col-professor { width: 20%; }
    .col-horario { width: 15%; }
    .col-periodo { width: 10%; }
    .col-vagas { width: 15%; }
    .col-acao { width: 15%; }

    .discipline-name { font-size: 0.9rem; font-weight: 600; color: #111827; }
    .discipline-hours { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

    .professor-info { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; color: #374151; }
    .professor-icon { font-size: 0.8rem; color: #9ca3af; }

    .schedule-day { font-size: 0.88rem; font-weight: 600; color: #374151; }
    .schedule-time { font-size: 0.8rem; color: #6b7280; font-family: 'Consolas', monospace; margin-top: 2px; }

    .vagas-info { display: flex; flex-direction: column; gap: 4px; min-width: 90px; }
    .vagas-bar { height: 5px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
    .vagas-fill { height: 100%; background: #22c55e; border-radius: 99px; transition: width 0.3s; }
    .vagas-fill.vagas-cheio { background: #ef4444; }
    .vagas-numbers { display: flex; flex-direction: column; gap: 1px; }
    .vagas-text { font-size: 0.82rem; font-weight: 500; color: #374151; }
    .vagas-text strong { font-weight: 700; color: #16a34a; }
    .vagas-text.sem-vagas { font-weight: 700; color: #ef4444; }
    .vagas-total { font-size: 0.74rem; color: #9ca3af; }

    :host ::ng-deep .btn-matricular .p-button {
      background: #2563eb; border-color: #2563eb; font-size: 0.82rem; font-weight: 600;
    }
    :host ::ng-deep .btn-matricular .p-button:hover { background: #1d4ed8; border-color: #1d4ed8; }

    .esgotado-chip {
      display: inline-block; padding: 0.2rem 0.7rem;
      background: #fef2f2; color: #ef4444;
      border-radius: 99px; font-size: 0.78rem; font-weight: 600;
    }
  `],
})
export class AulasDisponiveisPage implements OnInit {
  readonly store = inject(MatriculaStore);
  private messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const success = this.store.successMessage();
      if (success) {
        this.messageService.add({ severity: 'success', summary: 'Matriculado!', detail: success, life: 3000 });
        this.store.clearMessages();
      }
    });

    effect(() => {
      const error = this.store.error();
      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Erro na matricula', detail: error, life: 5000 });
        this.store.clearMessages();
      }
    });
  }

  ngOnInit(): void {
    this.store.loadAulasDisponiveis();
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

  getVagasPercent(aula: { vagasDisponiveis: number; maxAlunos: number }): number {
    if (aula.maxAlunos === 0) return 0;
    return Math.round(((aula.maxAlunos - aula.vagasDisponiveis) / aula.maxAlunos) * 100);
  }
}
