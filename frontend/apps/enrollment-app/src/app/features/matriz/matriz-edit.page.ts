import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Select,
    MultiSelect,
    Toast,
    LoadingComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <div class="page-wrapper">

      <!-- Page Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <span class="breadcrumb-link" (click)="router.navigate(['/matriz'])">
            <i class="pi pi-arrow-left"></i> Matriz Curricular
          </span>
          <i class="pi pi-chevron-right breadcrumb-sep"></i>
          <span>Editar Aula</span>
        </div>
        <h1 class="page-title">Editar Aula</h1>
        <p class="page-subtitle">Altere o professor, horario ou cursos autorizados</p>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <i class="pi pi-info-circle"></i>
        <span>A disciplina e a capacidade maxima nao podem ser alteradas. Para isso, exclua e recrie a aula.</span>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        @if (store.loading()) {
          <div class="loading-state"><unifor-loading /></div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="form-section">
              <h3 class="section-title">
                <i class="pi pi-pencil"></i> Dados Editaveis
              </h3>

              <div class="form-grid">

                <div class="field">
                  <label class="field-label">Professor</label>
                  <p-select
                    formControlName="professorId"
                    [options]="store.professores()"
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione o professor"
                    [filter]="true"
                    filterBy="nome"
                    [showClear]="true"
                    styleClass="w-full"
                  />
                  <small class="field-hint">Deixe em branco para manter o professor atual</small>
                </div>

                <div class="field">
                  <label class="field-label">Horario</label>
                  <p-select
                    formControlName="horarioId"
                    [options]="store.horarios()"
                    [optionLabel]="horarioLabel"
                    optionValue="id"
                    placeholder="Selecione o horario"
                    [showClear]="true"
                    styleClass="w-full"
                  />
                  <small class="field-hint">Deixe em branco para manter o horario atual</small>
                </div>

              </div>

              <div class="field field-full">
                <label class="field-label">Cursos Autorizados</label>
                <p-multiSelect
                  formControlName="cursosAutorizadosIds"
                  [options]="store.cursos()"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione os cursos"
                  [filter]="true"
                  filterBy="nome"
                  [showClear]="true"
                  styleClass="w-full"
                  display="chip"
                />
                <small class="field-hint">Alunos matriculados nao serao removidos por esta alteracao</small>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <p-button
                type="button"
                label="Cancelar"
                severity="secondary"
                icon="pi pi-times"
                (onClick)="router.navigate(['/matriz'])"
              />
              <p-button
                type="submit"
                label="Salvar Alteracoes"
                icon="pi pi-check"
                styleClass="btn-submit"
              />
            </div>

          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    .page-header { padding-bottom: 0.25rem; }
    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.84rem; color: #6b7280; margin-bottom: 0.5rem; }
    .breadcrumb-link { cursor: pointer; color: #2563eb; display: flex; align-items: center; gap: 0.3rem; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-sep { font-size: 0.7rem; color: #d1d5db; }
    .page-title { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 0.88rem; color: #6b7280; margin: 0.25rem 0 0; }

    .info-banner {
      display: flex; align-items: center; gap: 0.6rem;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; padding: 0.75rem 1rem;
      font-size: 0.85rem; color: #92400e;
      max-width: 780px;
    }

    .form-card {
      background: white; border: 1px solid #e5e7eb;
      border-radius: 12px; overflow: hidden; max-width: 780px;
    }

    .loading-state { padding: 3rem; display: flex; justify-content: center; }

    .form-section { padding: 1.75rem 1.75rem 0; }
    .section-title {
      font-size: 1rem; font-weight: 700; color: #1e3a5f;
      display: flex; align-items: center; gap: 0.5rem;
      padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6; margin: 0 0 1.5rem;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-full { padding: 0 1.75rem; margin-top: 1.25rem; }

    .field-label { font-size: 0.82rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
    .field-hint { font-size: 0.78rem; color: #9ca3af; }

    :host ::ng-deep .w-full { width: 100%; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1.25rem 1.75rem; margin-top: 1.5rem;
      border-top: 1px solid #f3f4f6; background: #fafafa;
    }
    :host ::ng-deep .btn-submit .p-button { background: #2563eb; border-color: #2563eb; font-weight: 600; }
    :host ::ng-deep .btn-submit .p-button:hover { background: #1d4ed8; border-color: #1d4ed8; }
  `],
})
export class MatrizEditPage implements OnInit {
  readonly store = inject(MatrizStore);
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  aulaId!: string;

  form: FormGroup = this.fb.group({
    professorId: [null],
    horarioId: [null],
    cursosAutorizadosIds: [[]],
  });

  horarioLabel = (h: { diaSemana: string; horaInicio: string; horaFim: string }) => {
    const dias: Record<string, string> = {
      SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui', SEX: 'Sex', SAB: 'Sab',
    };
    return `${dias[h.diaSemana] ?? h.diaSemana} ${h.horaInicio.substring(0, 5)} - ${h.horaFim.substring(0, 5)}`;
  };

  ngOnInit(): void {
    this.aulaId = this.route.snapshot.paramMap.get('id')!;
    this.store.loadReferencias();

    const aula = this.store.aulas().find((a) => a.id === this.aulaId);
    if (aula) {
      this.form.patchValue({
        professorId: aula.professor.id,
        horarioId: aula.horario.id,
        cursosAutorizadosIds: aula.cursosAutorizados.map((c) => c.id),
      });
    }
  }

  onSubmit(): void {
    const { professorId, horarioId, cursosAutorizadosIds } = this.form.value;
    this.store.editarAula({
      id: this.aulaId,
      request: {
        professorId: professorId ?? undefined,
        horarioId: horarioId ?? undefined,
        cursosAutorizadosIds: cursosAutorizadosIds?.length ? cursosAutorizadosIds : undefined,
      },
    });
    this.messageService.add({
      severity: 'success', summary: 'Alteracoes salvas', detail: 'Aula atualizada com sucesso.', life: 3000,
    });
    this.router.navigate(['/matriz']);
  }
}
