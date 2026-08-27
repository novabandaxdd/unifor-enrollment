import { inject, computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';
import { MatrizApiService } from './matriz.api.service';
import {
  AulaResponse,
  CriarAulaRequest,
  Curso,
  Disciplina,
  Horario,
  Professor,
} from './models';

type MatrizState = {
  aulas: AulaResponse[];
  loading: boolean;
  error: string | null;
  disciplinas: Disciplina[];
  professores: Professor[];
  horarios: Horario[];
  cursos: Curso[];
};

const initialState: MatrizState = {
  aulas: [],
  loading: false,
  error: null,
  disciplinas: [],
  professores: [],
  horarios: [],
  cursos: [],
};

export const MatrizStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ aulas }) => ({
    totalAulas: computed(() => aulas().length),
    aulasPorPeriodo: computed(() => {
      const map = new Map<string, AulaResponse[]>();
      for (const aula of aulas()) {
        const periodo = aula.horario.periodo;
        if (!map.has(periodo)) map.set(periodo, []);
        map.get(periodo)!.push(aula);
      }
      return map;
    }),
  })),
  withMethods((store, api = inject(MatrizApiService)) => ({
    loadAulas: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.listar().pipe(
            tapResponse(
              (aulas) => patchState(store, { aulas, loading: false }),
              () =>
                patchState(store, {
                  error: 'Erro ao carregar aulas',
                  loading: false,
                }),
            ),
          ),
        ),
      ),
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
              () => {},
            ),
          ),
        ),
      ),
    ),

    criarAula: rxMethod<CriarAulaRequest>(
      pipe(
        switchMap((req) =>
          api.criar(req).pipe(
            tapResponse(
              (aula) =>
                patchState(store, (state) => ({
                  aulas: [...state.aulas, aula],
                })),
              () => patchState(store, { error: 'Erro ao criar aula' }),
            ),
          ),
        ),
      ),
    ),

    excluirAula: rxMethod<string>(
      pipe(
        switchMap((id) =>
          api.excluir(id).pipe(
            tapResponse(
              () =>
                patchState(store, (state) => ({
                  aulas: state.aulas.filter((a) => a.id !== id),
                })),
              () => {},
            ),
          ),
        ),
      ),
    ),

    editarAula: rxMethod<{ id: string; horarioId?: string; professorId?: string; cursosAutorizadosIds?: string[] }>(
      pipe(
        switchMap(({ id, ...req }) =>
          api.editar(id, req).pipe(
            tapResponse(
              (updated) =>
                patchState(store, (state) => ({
                  aulas: state.aulas.map((a) => (a.id === id ? updated : a)),
                })),
              () => patchState(store, { error: 'Erro ao editar aula' }),
            ),
          ),
        ),
      ),
    ),
  })),
);
