import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { InputNumber } from 'primeng/inputnumber';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Select,
    MultiSelect,
    InputNumber,
    Toast,
    LoadingComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <div class="page-wrapper">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <span class="breadcrumb-link" (click)="router.navigate(['/matriz'])">
              <i class="pi pi-arrow-left"></i> Matriz Curricular
            </span>
            <i class="pi pi-chevron-right breadcrumb-sep"></i>
            <span>Nova Aula</span>
          </div>
          <h1 class="page-title">Criar Nova Aula</h1>
          <p class="page-subtitle">Preencha os dados para adicionar uma nova aula ao semestre</p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        @if (store.loading()) {
          <div class="loading-state"><unifor-loading /></div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="form-section">
              <h3 class="section-title">
                <i class="pi pi-book"></i> Dados da Aula
              </h3>

              <div class="form-grid">

                <div class="field">
                  <label class="field-label required">Disciplina</label>
                  <p-select
                    formControlName="disciplinaId"
                    [options]="store.disciplinas()"
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione a disciplina"
                    [filter]="true"
                    filterBy="nome"
                    styleClass="w-full"
                  />
                  <small class="field-hint">Escolha a disciplina que sera ministrada</small>
                  @if (form.get('disciplinaId')?.touched && form.get('disciplinaId')?.invalid) {
                    <small class="field-error">Disciplina e obrigatoria</small>
                  }
                </div>

                <div class="field">
                  <label class="field-label required">Professor</label>
                  <p-select
                    formControlName="professorId"
                    [options]="store.professores()"
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione o professor"
                    [filter]="true"
                    filterBy="nome"
                    styleClass="w-full"
                  />
                  @if (form.get('professorId')?.touched && form.get('professorId')?.invalid) {
                    <small class="field-error">Professor e obrigatorio</small>
                  }
                </div>

                <div class="field">
                  <label class="field-label required">Horario</label>
                  <p-select
                    formControlName="horarioId"
                    [options]="store.horarios()"
                    [optionLabel]="horarioLabel"
                    optionValue="id"
                    placeholder="Selecione o horario"
                    styleClass="w-full"
                  />
                  @if (form.get('horarioId')?.touched && form.get('horarioId')?.invalid) {
                    <small class="field-error">Horario e obrigatorio</small>
                  }
                </div>

                <div class="field">
                  <label class="field-label required">Maximo de Alunos</label>
                  <p-inputNumber
                    formControlName="maxAlunos"
                    [min]="1"
                    [max]="200"
                    placeholder="Ex: 40"
                    styleClass="w-full"
                    [showButtons]="true"
                  />
                  <small class="field-hint">Capacidade maxima da turma (1 a 200)</small>
                  @if (form.get('maxAlunos')?.touched && form.get('maxAlunos')?.invalid) {
                    <small class="field-error">Informe a capacidade maxima</small>
                  }
                </div>

              </div>

              <div class="field field-full">
                <label class="field-label required">Cursos Autorizados</label>
                <p-multiSelect
                  formControlName="cursosAutorizadosIds"
                  [options]="store.cursos()"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione um ou mais cursos"
                  [filter]="true"
                  filterBy="nome"
                  [showClear]="true"
                  styleClass="w-full"
                  display="chip"
                />
                <small class="field-hint">Somente alunos destes cursos poderao se matricular</small>
                @if (form.get('cursosAutorizadosIds')?.touched && form.get('cursosAutorizadosIds')?.invalid) {
                  <small class="field-error">Selecione ao menos um curso</small>
                }
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
                label="Criar Aula"
                icon="pi pi-check"
                [disabled]="form.invalid"
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

    .page-header { padding-bottom: 0.5rem; }
    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.84rem; color: #6b7280; margin-bottom: 0.5rem; }
    .breadcrumb-link { cursor: pointer; color: #2563eb; display: flex; align-items: center; gap: 0.3rem; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-sep { font-size: 0.7rem; color: #d1d5db; }
    .page-title { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 0.88rem; color: #6b7280; margin: 0.25rem 0 0; }

    .form-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      max-width: 780px;
    }

    .loading-state { padding: 3rem; display: flex; justify-content: center; }

    .form-section { padding: 1.75rem 1.75rem 0; }
    .section-title {
      font-size: 1rem; font-weight: 700; color: #1e3a5f;
      display: flex; align-items: center; gap: 0.5rem;
      padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6;
      margin: 0 0 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-full { padding: 0 1.75rem; margin-top: 1.25rem; }

    .field-label {
      font-size: 0.82rem; font-weight: 600; color: #374151;
      text-transform: uppercase; letter-spacing: 0.03em;
    }
    .field-label.required::after { content: ' *'; color: #ef4444; }
    .field-hint { font-size: 0.78rem; color: #9ca3af; }
    .field-error { font-size: 0.78rem; color: #ef4444; font-weight: 500; }

    :host ::ng-deep .w-full { width: 100%; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.25rem 1.75rem;
      margin-top: 1.5rem;
      border-top: 1px solid #f3f4f6;
      background: #fafafa;
    }
    :host ::ng-deep .btn-submit .p-button { background: #16a34a; border-color: #16a34a; font-weight: 600; }
    :host ::ng-deep .btn-submit .p-button:not(:disabled):hover { background: #15803d; border-color: #15803d; }
  `],
})
export class MatrizCreatePage implements OnInit {
  readonly store = inject(MatrizStore);
  readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    disciplinaId: [null, Validators.required],
    professorId: [null, Validators.required],
    horarioId: [null, Validators.required],
    cursosAutorizadosIds: [[], [Validators.required, Validators.minLength(1)]],
    maxAlunos: [null, [Validators.required, Validators.min(1)]],
  });

  horarioLabel = (h: { diaSemana: string; horaInicio: string; horaFim: string }) => {
    const dias: Record<string, string> = {
      SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui', SEX: 'Sex', SAB: 'Sab',
    };
    const dia = dias[h.diaSemana] ?? h.diaSemana;
    return `${dia} ${h.horaInicio.substring(0, 5)} - ${h.horaFim.substring(0, 5)}`;
  };

  ngOnInit(): void {
    this.store.loadReferencias();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.criarAula(this.form.value);
    this.messageService.add({
      severity: 'success', summary: 'Aula criada', detail: 'Nova aula adicionada a matriz.', life: 3000,
    });
    this.router.navigate(['/matriz']);
  }
}
