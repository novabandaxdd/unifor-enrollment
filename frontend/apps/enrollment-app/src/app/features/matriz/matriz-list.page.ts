import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    InputNumberModule,
    TagModule,
    FormsModule,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <h1 class="page-title">Matriz Curricular</h1>
      <p-button
        label="Nova Aula"
        icon="pi pi-plus"
        routerLink="criar"
      />
    </div>

    <div class="filter-bar">
      <p-dropdown
        [options]="periodosOptions"
        [(ngModel)]="filtroPeriodo"
        placeholder="Filtrar por período"
        showClear="true"
        (onChange)="aplicarFiltros()"
        styleClass="filter-field"
      />
      <p-inputNumber
        [(ngModel)]="filtroMaxAlunos"
        placeholder="Máx. alunos"
        [min]="1"
        [showButtons]="false"
        (onInput)="aplicarFiltros()"
        styleClass="filter-field"
      />
    </div>

    <unifor-error-message [message]="matrizStore.error()" />

    @if (matrizStore.loading()) {
      <unifor-loading />
    } @else {
      <p-table
        [value]="aulasFiltradas"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20]"
        stripedRows="true"
        responsiveLayout="scroll"
        emptyMessage="Nenhuma aula encontrada."
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="disciplina.nome">
              Disciplina <p-sortIcon field="disciplina.nome" />
            </th>
            <th pSortableColumn="professor.nome">
              Professor <p-sortIcon field="professor.nome" />
            </th>
            <th>Horário</th>
            <th>Cursos Autorizados</th>
            <th pSortableColumn="vagasDisponiveis">
              Vagas <p-sortIcon field="vagasDisponiveis" />
            </th>
            <th>Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-aula>
          <tr>
            <td>
              <div class="cell-primary">{{ aula.disciplina.nome }}</div>
              <div class="cell-secondary">{{ aula.disciplina.cargaHoraria }}h</div>
            </td>
            <td>
              <div class="cell-primary">{{ aula.professor.nome }}</div>
              <div class="cell-secondary">{{ aula.professor.email }}</div>
            </td>
            <td>
              <div class="cell-primary">{{ aula.horario.diaSemana }}</div>
              <div class="cell-secondary">
                {{ aula.horario.horaInicio }} – {{ aula.horario.horaFim }}
              </div>
              <p-tag
                [value]="aula.horario.periodo"
                [severity]="getPeriodoSeverity(aula.horario.periodo)"
              />
            </td>
            <td>
              @for (curso of aula.cursosAutorizados; track curso.id) {
                <p-tag [value]="curso.nome" severity="info" styleClass="mr-1 mb-1" />
              }
            </td>
            <td>
              <span [class]="aula.vagasDisponiveis > 0 ? 'vagas-ok' : 'vagas-esgotadas'">
                {{ aula.vagasDisponiveis }} / {{ aula.maxAlunos }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  severity="secondary"
                  size="small"
                  [routerLink]="['editar', aula.id]"
                  pTooltip="Editar"
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  (onClick)="confirmarExclusao(aula.id, aula.disciplina.nome)"
                  pTooltip="Excluir"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
      }

      .page-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e3a5f;
        margin: 0;
      }

      .filter-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .filter-field {
        min-width: 180px;
      }

      .cell-primary {
        font-weight: 500;
      }

      .cell-secondary {
        font-size: 0.82rem;
        color: #6b7280;
        margin-top: 2px;
      }

      .action-buttons {
        display: flex;
        gap: 0.4rem;
      }

      .vagas-ok {
        color: #15803d;
        font-weight: 600;
      }

      .vagas-esgotadas {
        color: #b91c1c;
        font-weight: 600;
      }
    `,
  ],
})
export class MatrizListPage implements OnInit {
  readonly matrizStore = inject(MatrizStore);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  filtroPeriodo: string | null = null;
  filtroMaxAlunos: number | null = null;

  periodosOptions = [
    { label: 'Manhã', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
  ];

  get aulasFiltradas() {
    let aulas = this.matrizStore.aulas();
    if (this.filtroPeriodo) {
      aulas = aulas.filter((a) => a.horario.periodo === this.filtroPeriodo);
    }
    if (this.filtroMaxAlunos != null) {
      aulas = aulas.filter((a) => a.maxAlunos <= this.filtroMaxAlunos!);
    }
    return aulas;
  }

  ngOnInit(): void {
    this.matrizStore.loadAulas();
  }

  aplicarFiltros(): void {
    // Filters applied reactively via getter
  }

  getPeriodoSeverity(periodo: string): 'success' | 'info' | 'warning' {
    const map: Record<string, 'success' | 'info' | 'warning'> = {
      MANHA: 'success',
      TARDE: 'info',
      NOITE: 'warning',
    };
    return map[periodo] ?? 'info';
  }

  confirmarExclusao(id: string, nome: string): void {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir a aula de "${nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.matrizStore.excluirAula(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Aula excluída',
          detail: `A aula de "${nome}" foi removida da matriz.`,
        });
      },
    });
  }
}
