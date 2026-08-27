import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    InputNumberModule,
    ToastModule,
    LoadingComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />

    <p-card header="Criar Nova Aula">
      @if (store.loading()) {
        <unifor-loading />
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

          <div class="field">
            <label for="disciplina">Disciplina *</label>
            <p-dropdown
              id="disciplina"
              formControlName="disciplinaId"
              [options]="store.disciplinas()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione a disciplina"
              [filter]="true"
              filterBy="nome"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="professor">Professor *</label>
            <p-dropdown
              id="professor"
              formControlName="professorId"
              [options]="store.professores()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o professor"
              [filter]="true"
              filterBy="nome"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="horario">Horário *</label>
            <p-dropdown
              id="horario"
              formControlName="horarioId"
              [options]="store.horarios()"
              [optionLabel]="horarioLabel"
              optionValue="id"
              placeholder="Selecione o horário"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="cursos">Cursos Autorizados *</label>
            <p-multiSelect
              id="cursos"
              formControlName="cursosAutorizadosIds"
              [options]="store.cursos()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione os cursos"
              [filter]="true"
              filterBy="nome"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="maxAlunos">Máximo de Alunos *</label>
            <p-inputNumber
              id="maxAlunos"
              formControlName="maxAlunos"
              [min]="1"
              [max]="200"
              placeholder="Ex: 40"
              class="w-full"
            />
          </div>

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
            />
          </div>

        </form>
      }
    </p-card>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 1.25rem; max-width: 600px; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-weight: 500; font-size: 0.9rem; color: #374151; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; }
    .w-full { width: 100%; }
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
    cursosAutorizadosIds: [[], Validators.required],
    maxAlunos: [null, [Validators.required, Validators.min(1)]],
  });

  horarioLabel = (h: { diaSemana: string; horaInicio: string; horaFim: string }) =>
    `${h.diaSemana} ${h.horaInicio}–${h.horaFim}`;

  ngOnInit(): void {
    this.store.loadReferencias();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.store.criarAula(this.form.value);
    this.router.navigate(['/matriz']);
  }
}
