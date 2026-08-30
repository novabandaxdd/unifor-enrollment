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

    <p-card>
      <ng-template pTemplate="header">
        <div class="card-header-row">
          <h2 class="card-title">Matriz Curricular</h2>
          <p-button
            label="Nova Aula"
            icon="pi pi-plus"
            routerLink="/matriz/criar"
          />
        </div>
      </ng-template>

      <!-- Filtros -->
      <div class="filters-row">
        <div class="filter-field">
          <label>Per├¡odo</label>
          <p-select
            [(ngModel)]="filtroPeriodo"
            [options]="periodos"
            placeholder="Todos os per├¡odos"
            [showClear]="true"
            (onChange)="aplicarFiltros()"
            styleClass="filter-select"
          />
        </div>

        <div class="filter-field">
          <label>Curso</label>
          <p-select
            [(ngModel)]="filtroCursoId"
            [options]="store.cursos()"
            optionLabel="nome"
            optionValue="id"
            placeholder="Todos os cursos"
            [showClear]="true"
            [filter]="true"
            filterBy="nome"
            (onChange)="aplicarFiltros()"
            styleClass="filter-select"
          />
        </div>

        <div class="filter-field">
          <label>M├íx. Alunos Ôëñ</label>
          <p-inputNumber
            [(ngModel)]="filtroMaxAlunos"
            [min]="1"
            [max]="500"
            placeholder="Qualquer"
            (onBlur)="aplicarFiltros()"
            styleClass="filter-number"
          />
        </div>

        <p-button
          icon="pi pi-filter-slash"
          label="Limpar"
          severity="secondary"
          size="small"
          (onClick)="limparFiltros()"
        />
      </div>

      <unifor-error-message [message]="store.error()" />

      @if (store.loading()) {
        <unifor-loading />
      } @else {
        <p-table
          [value]="store.aulas()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          stripedRows
          responsiveLayout="scroll"
          emptyMessage="Nenhuma aula cadastrada para os filtros selecionados."
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="disciplina.nome">
                Disciplina <p-sortIcon field="disciplina.nome" />
              </th>
              <th pSortableColumn="professor.nome">
                Professor <p-sortIcon field="professor.nome" />
              </th>
              <th>Hor├írio</th>
              <th>Per├¡odo</th>
              <th>Vagas</th>
              <th>Cursos</th>
              <th>A├º├Áes</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-aula>
            <tr>
              <td>
                <div class="cell-primary">{{ aula.disciplina.nome }}</div>
                <div class="cell-secondary">{{ aula.disciplina.cargaHoraria }}h</div>
              </td>
              <td>{{ aula.professor.nome }}</td>
              <td>
                <div class="cell-primary">{{ aula.horario.diaSemana }}</div>
                <div class="cell-secondary">
                  {{ aula.horario.horaInicio }} ÔÇô {{ aula.horario.horaFim }}
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
                  [value]="aula.vagasDisponiveis + '/' + aula.maxAlunos"
                  [severity]="aula.vagasDisponiveis > 0 ? 'success' : 'danger'"
                />
              </td>
              <td>
                <div class="cursos-list">
                  @for (curso of aula.cursosAutorizados; track curso.id) {
                    <p-tag [value]="curso.nome" severity="info" />
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
                    pTooltip="Editar"
                  />
                  <p-button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    (onClick)="confirmarExclusao(aula)"
                    pTooltip="Excluir"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </p-card>
  `,
  styles: [`
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem 0;
      width: 100%;
    }
    .card-title { font-size: 1.3rem; font-weight: 600; color: #1e3a5f; margin: 0; }
    .filters-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .filter-field label {
      font-size: 0.82rem;
      font-weight: 500;
      color: #6b7280;
    }
    :host ::ng-deep .filter-select { min-width: 180px; }
    :host ::ng-deep .filter-number { max-width: 120px; }
    .cell-primary { font-weight: 500; }
    .cell-secondary { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }
    .cursos-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .actions-row { display: flex; gap: 4px; }
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
    { label: 'Manh├ú', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
  ];

  constructor() {
    effect(() => {
      const err = this.store.error();
      if (err) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err,
          life: 5000,
        });
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
      message: `Deseja excluir a aula de "<strong>${aula.disciplina.nome}</strong>"?<br>Esta a├º├úo n├úo pode ser desfeita.`,
      header: 'Confirmar Exclus├úo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.excluirAula(aula.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Exclu├¡do',
          detail: `Aula de "${aula.disciplina.nome}" exclu├¡da com sucesso.`,
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
