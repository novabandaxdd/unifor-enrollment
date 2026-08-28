import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
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
        <p-select
          [(ngModel)]="filtroPeriodo"
          [options]="periodos"
          placeholder="Filtrar por período"
          [showClear]="true"
          (onChange)="aplicarFiltros()"
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
          emptyMessage="Nenhuma aula cadastrada."
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
              <th>Período</th>
              <th>Vagas</th>
              <th>Cursos</th>
              <th>Ações</th>
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
    .filters-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
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

  readonly periodos = [
    { label: 'Manhã', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
  ];

  ngOnInit(): void {
    this.store.loadAulas();
  }

  aplicarFiltros(): void {
    this.store.loadAulas(
      this.filtroPeriodo ? { periodo: this.filtroPeriodo } : undefined
    );
  }

  confirmarExclusao(aula: { id: string; disciplina: { nome: string } }): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a aula de "${aula.disciplina.nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.excluirAula(aula.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Aula excluída com sucesso',
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
