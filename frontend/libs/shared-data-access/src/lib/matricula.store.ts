import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { MatriculaApiService } from './matricula.api.service';
import { AulaResponse, MatriculaResponse } from './models';

type MatriculaState = {
  minhasMatriculas: MatriculaResponse[];
  aulasDisponiveis: AulaResponse[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

const initialState: MatriculaState = {
  minhasMatriculas: [],
  aulasDisponiveis: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const MatriculaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(MatriculaApiService)) => ({
    loadMinhasMatriculas: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getMinhas().pipe(
            tapResponse(
              (data) =>
                patchState(store, { minhasMatriculas: data, loading: false }),
              () =>
                patchState(store, {
                  error: 'Erro ao carregar matriculas',
                  loading: false,
                })
            )
          )
        )
      )
    ),

    loadAulasDisponiveis: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getDisponiveis().pipe(
            tapResponse(
              (data) =>
                patchState(store, { aulasDisponiveis: data, loading: false }),
              () =>
                patchState(store, {
                  error: 'Erro ao carregar aulas disponiveis',
                  loading: false,
                })
            )
          )
        )
      )
    ),

    matricular: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { loading: true, error: null, successMessage: null })
        ),
        switchMap((aulaMatrizId) =>
          api.matricular(aulaMatrizId).pipe(
            tapResponse(
              (matricula) =>
                patchState(store, (state) => ({
                  minhasMatriculas: [...state.minhasMatriculas, matricula],
                  aulasDisponiveis: state.aulasDisponiveis.filter(
                    (a) => a.id !== aulaMatrizId
                  ),
                  loading: false,
                  successMessage: 'Matricula realizada com sucesso!',
                })),
              (err: HttpErrorResponse) =>
                patchState(store, {
                  error: err?.error?.message ?? 'Erro ao realizar matricula',
                  loading: false,
                })
            )
          )
        )
      )
    ),

    cancelarMatricula: rxMethod<string>(
      pipe(
        switchMap((id) =>
          api.cancelar(id).pipe(
            tapResponse(
              () =>
                patchState(store, (state) => ({
                  minhasMatriculas: state.minhasMatriculas.filter(
                    (m) => m.id !== id
                  ),
                })),
              () => {}
            )
          )
        )
      )
    ),

    clearMessages: () =>
      patchState(store, { error: null, successMessage: null }),
  }))
);
