import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { forkJoin } from 'rxjs';
import { MatrizApiService } from './matriz.api.service';
import {
  AulaResponse,
  CriarAulaRequest,
  Curso,
  Disciplina,
  EditarAulaRequest,
  Horario,
  Professor,
} from './models';

type MatrizState = {
  aulas: AulaResponse[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  disciplinas: Disciplina[];
  professores: Professor[];
  horarios: Horario[];
  cursos: Curso[];
};

const initialState: MatrizState = {
  aulas: [],
  loading: false,
  error: null,
  successMessage: null,
  disciplinas: [],
  professores: [],
  horarios: [],
  cursos: [],
};

export const MatrizStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(MatrizApiService)) => ({
    loadAulas: rxMethod<{ periodo?: string; cursoId?: string; maxAlunos?: number; horarioId?: string } | void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((filtros) =>
          api.listar(filtros ?? undefined).pipe(
            tapResponse(
              (aulas) => patchState(store, { aulas, loading: false }),
              () =>
                patchState(store, {
                  error: 'Erro ao carregar aulas',
                  loading: false,
                })
            )
          )
        )
      )
    ),

    loadReferencias: rxMethod<void>(
      pipe(
        switchMap(() =>
          forkJoin({
            disciplinas: api.getDisciplinas(),
            professores: api.getProfessores(),
            horarios: api.getHorarios(),
            cursos: api.getCursos(),
          }).pipe(
            tapResponse(
              (data) => patchState(store, data),
              () => {}
            )
          )
        )
      )
    ),

    criarAula: rxMethod<CriarAulaRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((req) =>
          api.criar(req).pipe(
            tapResponse(
              (aula) =>
                patchState(store, (state) => ({
                  aulas: [...state.aulas, aula],
                  loading: false,
                })),
              () =>
                patchState(store, {
                  error: 'Erro ao criar aula',
                  loading: false,
                })
            )
          )
        )
      )
    ),

    editarAula: rxMethod<{ id: string; request: EditarAulaRequest }>(
      pipe(
        switchMap(({ id, request }) =>
          api.editar(id, request).pipe(
            tapResponse(
              (updated) =>
                patchState(store, (state) => ({
                  aulas: state.aulas.map((a) => (a.id === id ? updated : a)),
                })),
              () => patchState(store, { error: 'Erro ao editar aula' })
            )
          )
        )
      )
    ),

    excluirAula: rxMethod<string>(
      pipe(
        switchMap((id) =>
          api.excluir(id).pipe(
            tapResponse(
              () =>
                patchState(store, (state) => ({
                  aulas: state.aulas.filter((a) => a.id !== id),
                  successMessage: 'Aula removida com sucesso!',
                })),
              (err: HttpErrorResponse) =>
                patchState(store, {
                  error: err?.error?.message ?? 'Erro ao excluir aula',
                })
            )
          )
        )
      )
    ),

    clearError: () => patchState(store, { error: null }),

    clearMessages: () => patchState(store, { error: null, successMessage: null }),
  }))
);
