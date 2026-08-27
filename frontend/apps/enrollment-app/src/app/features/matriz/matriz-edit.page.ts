import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    LoadingComponent,
  ],
  template: `
    <p-card header="Editar Aula">
      @if (store.loading()) {
        <unifor-loading />
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

          <div class="field">
            <label for="professor">Professor</label>
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
            <label for="horario">Horário</label>
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
            <label for="cursos">Cursos Autorizados</label>
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
              label="Salvar Alterações"
              icon="pi pi-check"
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
export class MatrizEditPage implements OnInit {
  readonly store = inject(MatrizStore);
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  aulaId!: string;

  form: FormGroup = this.fb.group({
    professorId: [null],
    horarioId: [null],
    cursosAutorizadosIds: [[]],
  });

  horarioLabel = (h: { diaSemana: string; horaInicio: string; horaFim: string }) =>
    `${h.diaSemana} ${h.horaInicio}–${h.horaFim}`;

  ngOnInit(): void {
    this.aulaId = this.route.snapshot.paramMap.get('id')!;
    this.store.loadReferencias();

    // Pre-populate with current aula data
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
        cursosAutorizadosIds: cursosAutorizadosIds?.length
          ? cursosAutorizadosIds
          : undefined,
      },
    });
    this.router.navigate(['/matriz']);
  }
}
