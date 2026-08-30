import { Component, OnInit, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    TableModule,
    Button,
    Tag,
    Card,
    Select,
    InputNumber,
    ConfirmDialog,
    Toast,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast position="top-right" />
    <p-confirmDialog />

    <div class="page-wrapper">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Matriz Curricular</h1>
          <p class="page-subtitle">Gerencie as aulas do semestre vigente</p>
        </div>
        <p-button
          label="Nova Aula"
          icon="pi pi-plus"
          routerLink="/matriz/criar"
          styleClass="btn-primary-action"
        />
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <i class="pi pi-filter filter-icon"></i>
          <span class="filter-label">Filtros:</span>
        </div>

        <div class="filter-field">
          <label class="field-label">Periodo</label>
          <p-select
            [(ngModel)]="filtroPeriodo"
            [options]="periodos"
            placeholder="Todos"
            [showClear]="true"
            (onChange)="aplicarFiltros()"
            styleClass="filter-select"
          />
        </div>

        <div class="filter-field">
          <label class="field-label">Curso</label>
          <p-select
            [(ngModel)]="filtroCursoId"
            [options]="store.cursos()"
            optionLabel="nome"
            optionValue="id"
            placeholder="Todos"
            [showClear]="true"
            [filter]="true"
            filterBy="nome"
            (onChange)="aplicarFiltros()"
            styleClass="filter-select"
          />
        </div>

        <div class="filter-field">
          <label class="field-label">Max. Alunos</label>
          <p-inputNumber
            [(ngModel)]="filtroMaxAlunos"
            [min]="1"
            [max]="500"
            placeholder="Qualquer"
            (onBlur)="aplicarFiltros()"
            styleClass="filter-number"
          />
        </div>

        @if (filtroPeriodo || filtroCursoId || filtroMaxAlunos) {
          <p-button
            icon="pi pi-times-circle"
            label="Limpar"
            severity="secondary"
            size="small"
            (onClick)="limparFiltros()"
            styleClass="btn-clear"
          />
        }
      </div>

      <!-- Content Area -->
      <div class="content-card">
        <unifor-error-message [message]="store.error()" />

        @if (store.loading()) {
          <div class="loading-state">
            <unifor-loading />
          </div>
        } @else if (store.aulas().length === 0) {
          <div class="empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <h3>Nenhuma aula encontrada</h3>
            <p>Nenhuma aula corresponde aos filtros selecionados.<br>Tente remover os filtros ou crie uma nova aula.</p>
            <p-button
              label="Criar Primeira Aula"
              icon="pi pi-plus"
              severity="secondary"
              routerLink="/matriz/criar"
            />
          </div>
        } @else {
          <!-- Summary bar -->
          <div class="summary-bar">
            <span class="summary-count">
              <strong>{{ store.aulas().length }}</strong> aula{{ store.aulas().length !== 1 ? 's' : '' }} encontrada{{ store.aulas().length !== 1 ? 's' : '' }}
            </span>
          </div>

          <p-table
            [value]="store.aulas()"
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
                <th class="col-cursos">Cursos</th>
                <th class="col-acoes">Acoes</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-aula>
              <tr class="table-row">
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
                    <span class="vagas-text" [class.sem-vagas]="aula.vagasDisponiveis === 0">
                      {{ aula.vagasDisponiveis }}/{{ aula.maxAlunos }}
                    </span>
                  </div>
                </td>

                <td>
                  <div class="cursos-list">
                    @for (curso of aula.cursosAutorizados.slice(0, 2); track curso.id) {
                      <span class="curso-chip">{{ curso.nome }}</span>
                    }
                    @if (aula.cursosAutorizados.length > 2) {
                      <span class="curso-chip curso-more">+{{ aula.cursosAutorizados.length - 2 }}</span>
                    }
                  </div>
                </td>

                <td>
                  <div class="actions-row">
                    <p-button
                      icon="pi pi-pencil"
                      size="small"
                      severity="secondary"
                      [routerLink]="['/matriz/editar', aula.id]"
                      pTooltip="Editar aula"
                      tooltipPosition="top"
                      styleClass="action-btn"
                    />
                    <p-button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      (onClick)="confirmarExclusao(aula)"
                      pTooltip="Excluir aula"
                      tooltipPosition="top"
                      styleClass="action-btn"
                    />
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0 0 0.5rem;
    }
    .page-title { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 0.88rem; color: #6b7280; margin: 0.25rem 0 0; }
    :host ::ng-deep .btn-primary-action .p-button {
      background: #16a34a; border-color: #16a34a; font-weight: 600;
    }
    :host ::ng-deep .btn-primary-action .p-button:hover { background: #15803d; border-color: #15803d; }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }
    .filter-group { display: flex; align-items: center; gap: 0.4rem; padding-bottom: 0.15rem; }
    .filter-icon { color: #6b7280; font-size: 0.9rem; }
    .filter-label { font-size: 0.82rem; font-weight: 600; color: #6b7280; white-space: nowrap; }
    .filter-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-label { font-size: 0.78rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
    :host ::ng-deep .filter-select { min-width: 170px; }
    :host ::ng-deep .filter-number { max-width: 110px; }
    :host ::ng-deep .btn-clear .p-button { height: 38px; }

    /* Content Card */
    .content-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Summary */
    .summary-bar {
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
    }
    .summary-count { font-size: 0.85rem; color: #6b7280; }
    .summary-count strong { color: #111827; }

    /* Empty + Loading States */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-icon { font-size: 3rem; color: #d1d5db; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 600; color: #374151; margin: 0; }
    .empty-state p { font-size: 0.88rem; color: #9ca3af; margin: 0; line-height: 1.6; }
    .loading-state { padding: 3rem; display: flex; justify-content: center; }

    /* Table */
    :host ::ng-deep .unifor-table .p-datatable-thead > tr > th {
      background: #f9fafb;
      color: #374151;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
      padding: 0.85rem 1rem;
    }
    :host ::ng-deep .unifor-table .p-datatable-tbody > tr > td { padding: 0.85rem 1rem; vertical-align: middle; }
    :host ::ng-deep .unifor-table .p-datatable-tbody > tr:hover > td { background: #f0fdf4; }

    .col-disciplina { width: 22%; }
    .col-professor { width: 16%; }
    .col-horario { width: 13%; }
    .col-periodo { width: 10%; }
    .col-vagas { width: 13%; }
    .col-cursos { width: 20%; }
    .col-acoes { width: 6%; }

    /* Cell content */
    .discipline-name { font-size: 0.9rem; font-weight: 600; color: #111827; }
    .discipline-hours { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

    .professor-info { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; color: #374151; }
    .professor-icon { font-size: 0.8rem; color: #9ca3af; }

    .schedule-day { font-size: 0.88rem; font-weight: 600; color: #374151; }
    .schedule-time { font-size: 0.8rem; color: #6b7280; font-family: 'Consolas', monospace; margin-top: 2px; }

    /* Vagas progress */
    .vagas-info { display: flex; flex-direction: column; gap: 4px; min-width: 80px; }
    .vagas-bar { height: 5px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
    .vagas-fill { height: 100%; background: #22c55e; border-radius: 99px; transition: width 0.3s; }
    .vagas-fill.vagas-cheio { background: #ef4444; }
    .vagas-text { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .vagas-text.sem-vagas { color: #ef4444; }

    /* Cursos chips */
    .cursos-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .curso-chip {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .curso-more { background: #f3f4f6; color: #6b7280; }

    /* Actions */
    .actions-row { display: flex; gap: 4px; }
    :host ::ng-deep .action-btn .p-button { width: 32px; height: 32px; padding: 0; }
  `],
})
export class MatrizListPage implements OnInit {
  readonly store = inject(MatrizStore);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  filtroPeriodo: string | null = null;
  filtroCursoId: string | null = null;
  filtroMaxAlunos: number | null = null;

  readonly periodos = [
    { label: 'Manha', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
  ];

  constructor() {
    effect(() => {
      const err = this.store.error();
      if (err) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err, life: 5000 });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadReferencias();
    this.store.loadAulas();
  }

  aplicarFiltros(): void {
    const filtros: { periodo?: string; cursoId?: string; maxAlunos?: number } = {};
    if (this.filtroPeriodo) filtros['periodo'] = this.filtroPeriodo;
    if (this.filtroCursoId) filtros['cursoId'] = this.filtroCursoId;
    if (this.filtroMaxAlunos != null) filtros['maxAlunos'] = this.filtroMaxAlunos;
    this.store.loadAulas(Object.keys(filtros).length ? filtros : undefined);
  }

  limparFiltros(): void {
    this.filtroPeriodo = null;
    this.filtroCursoId = null;
    this.filtroMaxAlunos = null;
    this.store.loadAulas();
  }

  confirmarExclusao(aula: { id: string; disciplina: { nome: string } }): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a aula de <strong>${aula.disciplina.nome}</strong>?<br><small>Esta acao nao pode ser desfeita.</small>`,
      header: 'Confirmar Exclusao',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.excluirAula(aula.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Excluido',
          detail: `Aula de "${aula.disciplina.nome}" removida com sucesso.`,
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
    const map: Record<string, string> = { MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' };
    return map[periodo] ?? periodo;
  }

  getPeriodoSeverity(periodo: string): 'success' | 'info' | 'warn' {
    const map: Record<string, 'success' | 'info' | 'warn'> = {
      MANHA: 'success', TARDE: 'info', NOITE: 'warn',
    };
    return map[periodo] ?? 'info';
  }

  getVagasPercent(aula: { vagasDisponiveis: number; maxAlunos: number }): number {
    if (aula.maxAlunos === 0) return 0;
    return Math.round(((aula.maxAlunos - aula.vagasDisponiveis) / aula.maxAlunos) * 100);
  }
}
