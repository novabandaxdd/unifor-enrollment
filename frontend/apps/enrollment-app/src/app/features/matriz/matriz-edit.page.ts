import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { MatrizStore } from '@unifor/shared-data-access';
import { LoadingComponent, ErrorMessageComponent } from '@unifor/shared-ui';

@Component({
  selector: 'app-matriz-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
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
      <h1 class="page-title">Editar Aula</h1>
    </div>

    <unifor-error-message [message]="matrizStore.error()" />

    @if (matrizStore.loading()) {
      <unifor-loading />
    } @else {
      <p-card styleClass="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-field">
              <label for="professor">Professor</label>
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
            </div>

            <div class="form-field">
              <label for="horario">Horário</label>
              <p-dropdown
                inputId="horario"
                formControlName="horarioId"
                [options]="horariosOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um horário"
                styleClass="w-full"
              />
            </div>

            <div class="form-field">
              <label for="cursos">Cursos Autorizados</label>
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
              label="Salvar Alterações"
              icon="pi pi-check"
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
export class MatrizEditPage implements OnInit {
  readonly matrizStore = inject(MatrizStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  saving = false;
  aulaId!: string;

  form: FormGroup = this.fb.group({
    professorId: [null],
    horarioId: [null],
    cursosAutorizadosIds: [[]],
  });

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
    this.aulaId = this.route.snapshot.paramMap.get('id')!;
    this.matrizStore.loadReferencias();

    // Pre-populate with current aula data from store
    const aula = this.matrizStore.aulas().find((a) => a.id === this.aulaId);
    if (aula) {
      this.form.patchValue({
        professorId: aula.professor.id,
        horarioId: aula.horario.id,
        cursosAutorizadosIds: aula.cursosAutorizados.map((c) => c.id),
      });
    }
  }

  onSubmit(): void {
    this.saving = true;
    const payload = { id: this.aulaId, ...this.form.value };
    this.matrizStore.editarAula(payload);
    setTimeout(() => {
      this.saving = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Aula atualizada',
        detail: 'As alterações foram salvas com sucesso.',
      });
      this.router.navigate(['/matriz']);
    }, 600);
  }
}
