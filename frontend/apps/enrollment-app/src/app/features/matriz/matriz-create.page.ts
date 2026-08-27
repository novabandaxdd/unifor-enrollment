import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    CardModule,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="page-header">
      <a routerLink="/matriz" class="back-link">
        <i class="pi pi-arrow-left"></i> Voltar
      </a>
      <h1 class="page-title">Nova Aula na Matriz</h1>
    </div>

    <unifor-error-message [message]="matrizStore.error()" />

    @if (matrizStore.loading()) {
      <unifor-loading />
    } @else {
      <p-card styleClass="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-field">
              <label for="disciplina">Disciplina <span class="required">*</span></label>
              <p-dropdown
                inputId="disciplina"
                formControlName="disciplinaId"
                [options]="disciplinasOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione uma disciplina"
                [filter]="true"
                filterPlaceholder="Buscar disciplina"
                styleClass="w-full"
              />
              @if (form.get('disciplinaId')?.invalid && form.get('disciplinaId')?.touched) {
                <small class="field-error">Disciplina é obrigatória</small>
              }
            </div>

            <div class="form-field">
              <label for="professor">Professor <span class="required">*</span></label>
              <p-dropdown
                inputId="professor"
                formControlName="professorId"
                [options]="professoresOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um professor"
                [filter]="true"
                filterPlaceholder="Buscar professor"
                styleClass="w-full"
              />
              @if (form.get('professorId')?.invalid && form.get('professorId')?.touched) {
                <small class="field-error">Professor é obrigatório</small>
              }
            </div>

            <div class="form-field">
              <label for="horario">Horário <span class="required">*</span></label>
              <p-dropdown
                inputId="horario"
                formControlName="horarioId"
                [options]="horariosOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um horário"
                styleClass="w-full"
              />
              @if (form.get('horarioId')?.invalid && form.get('horarioId')?.touched) {
                <small class="field-error">Horário é obrigatório</small>
              }
            </div>

            <div class="form-field">
              <label for="cursos">Cursos Autorizados <span class="required">*</span></label>
              <p-multiSelect
                inputId="cursos"
                formControlName="cursosAutorizadosIds"
                [options]="cursosOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione os cursos"
                [filter]="true"
                filterPlaceholder="Buscar curso"
                styleClass="w-full"
              />
              @if (form.get('cursosAutorizadosIds')?.invalid && form.get('cursosAutorizadosIds')?.touched) {
                <small class="field-error">Selecione ao menos um curso</small>
              }
            </div>

            <div class="form-field">
              <label for="maxAlunos">Máximo de Alunos <span class="required">*</span></label>
              <p-inputNumber
                inputId="maxAlunos"
                formControlName="maxAlunos"
                [min]="1"
                [max]="200"
                placeholder="Ex: 40"
                styleClass="w-full"
              />
              @if (form.get('maxAlunos')?.invalid && form.get('maxAlunos')?.touched) {
                <small class="field-error">Informe o número máximo de alunos (mín. 1)</small>
              }
            </div>
          </div>

          <div class="form-actions">
            <p-button
              type="button"
              label="Cancelar"
              severity="secondary"
              routerLink="/matriz"
            />
            <p-button
              type="submit"
              label="Criar Aula"
              icon="pi pi-check"
              [disabled]="form.invalid || saving"
              [loading]="saving"
            />
          </div>
        </form>
      </p-card>
    }
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .page-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e3a5f;
        margin: 0;
      }

      .back-link {
        color: #3b82f6;
        text-decoration: none;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .back-link:hover {
        text-decoration: underline;
      }

      .form-card {
        max-width: 720px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .form-field label {
        font-weight: 500;
        font-size: 0.9rem;
      }

      .required {
        color: #dc2626;
      }

      .field-error {
        color: #dc2626;
        font-size: 0.8rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
    `,
  ],
})
export class MatrizCreatePage implements OnInit {
  readonly matrizStore = inject(MatrizStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  saving = false;

  form: FormGroup = this.fb.group({
    disciplinaId: [null, Validators.required],
    professorId: [null, Validators.required],
    horarioId: [null, Validators.required],
    cursosAutorizadosIds: [[], Validators.required],
    maxAlunos: [null, [Validators.required, Validators.min(1)]],
  });

  get disciplinasOptions() {
    return this.matrizStore
      .disciplinas()
      .map((d) => ({ label: `${d.nome} (${d.cargaHoraria}h)`, value: d.id }));
  }

  get professoresOptions() {
    return this.matrizStore
      .professores()
      .map((p) => ({ label: p.nome, value: p.id }));
  }

  get horariosOptions() {
    return this.matrizStore
      .horarios()
      .map((h) => ({
        label: `${h.diaSemana} ${h.horaInicio}–${h.horaFim} (${h.periodo})`,
        value: h.id,
      }));
  }

  get cursosOptions() {
    return this.matrizStore
      .cursos()
      .map((c) => ({ label: c.nome, value: c.id }));
  }

  ngOnInit(): void {
    this.matrizStore.loadReferencias();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.matrizStore.criarAula(this.form.value);
    // Navigate after a short delay to let the store update
    setTimeout(() => {
      this.saving = false;
      this.router.navigate(['/matriz']);
    }, 600);
  }
}
