/**
 * MatriculaStore — Testes Unitarios
 *
 * Cobre:
 * - Estado inicial correto
 * - loadMinhasMatriculas: sucesso e erro HTTP
 * - loadAulasDisponiveis: sucesso e erro HTTP
 * - matricular: adiciona matricula, remove aula de disponiveis, seta successMessage
 * - matricular com erro 409: seta error, NAO altera listas
 * - matricular com erro sem body: usa mensagem generica
 * - cancelarMatricula: remove da lista, silencia erro
 * - clearMessages: limpa error e successMessage
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import {
  MatriculaStore,
  MatriculaApiService,
  ENVIRONMENT,
  AulaResponse,
  MatriculaResponse,
} from '@unifor/shared-data-access';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mkHorario = (id = 'h1') => ({
  id,
  diaSemana: 'SEG',
  horaInicio: '08:00:00',
  horaFim: '10:00:00',
  periodo: 'MANHA',
});

const mkAula = (id: string, vagas = 5): AulaResponse => ({
  id,
  disciplina: { id: 'd1', nome: 'Algoritmos', cargaHoraria: 80 },
  professor: { id: 'p1', nome: 'Dr. Roberto', email: 'r@unifor.br' },
  horario: mkHorario(),
  cursosAutorizados: [{ id: 'c1', nome: 'Ciencia da Computacao' }],
  maxAlunos: 30,
  vagasDisponiveis: vagas,
  ativo: true,
});

const mkMatricula = (id: string, aulaId: string): MatriculaResponse => ({
  id,
  aulaMatriz: mkAula(aulaId),
  dataMatricula: '2025-01-15T10:00:00',
  ativo: true,
});

// ── Setup ─────────────────────────────────────────────────────────────────────

function buildApi(
  overrides: Partial<jest.Mocked<MatriculaApiService>> = {}
): jest.Mocked<MatriculaApiService> {
  return {
    getMinhas: jest.fn().mockReturnValue(of([])),
    getDisponiveis: jest.fn().mockReturnValue(of([])),
    matricular: jest.fn().mockReturnValue(of(mkMatricula('m1', 'a1'))),
    cancelar: jest.fn().mockReturnValue(of(undefined)),
    ...overrides,
  } as unknown as jest.Mocked<MatriculaApiService>;
}

function setup(overrides: Partial<jest.Mocked<MatriculaApiService>> = {}) {
  const api = buildApi(overrides);
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      { provide: ENVIRONMENT, useValue: { apiUrl: 'http://localhost:8080' } },
      { provide: MatriculaApiService, useValue: api },
    ],
  });
  return { store: TestBed.inject(MatriculaStore), api };
}

afterEach(() => TestBed.resetTestingModule());

// ── Testes ────────────────────────────────────────────────────────────────────

describe('MatriculaStore', () => {

  describe('estado inicial', () => {
    it('deve ter listas vazias, loading=false e sem mensagens', () => {
      const { store } = setup();
      expect(store.minhasMatriculas()).toEqual([]);
      expect(store.aulasDisponiveis()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.successMessage()).toBeNull();
    });
  });

  // ── loadMinhasMatriculas ──────────────────────────────────────────────────

  describe('loadMinhasMatriculas', () => {
    it('preenche minhasMatriculas com resposta da API', fakeAsync(() => {
      const data = [mkMatricula('m1', 'a1'), mkMatricula('m2', 'a2')];
      const { store, api } = setup({
        getMinhas: jest.fn().mockReturnValue(of(data)),
      });

      store.loadMinhasMatriculas();
      tick();

      expect(api.getMinhas).toHaveBeenCalledTimes(1);
      expect(store.minhasMatriculas()).toHaveLength(2);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    }));

    it('seta error quando API falha', fakeAsync(() => {
      const { store } = setup({
        getMinhas: jest.fn().mockReturnValue(throwError(() => new Error('net'))),
      });

      store.loadMinhasMatriculas();
      tick();

      expect(store.error()).toBe('Erro ao carregar matriculas');
      expect(store.loading()).toBe(false);
    }));
  });

  // ── loadAulasDisponiveis ──────────────────────────────────────────────────

  describe('loadAulasDisponiveis', () => {
    it('preenche aulasDisponiveis com resposta da API', fakeAsync(() => {
      const data = [mkAula('a1'), mkAula('a2'), mkAula('a3')];
      const { store, api } = setup({
        getDisponiveis: jest.fn().mockReturnValue(of(data)),
      });

      store.loadAulasDisponiveis();
      tick();

      expect(api.getDisponiveis).toHaveBeenCalledTimes(1);
      expect(store.aulasDisponiveis()).toHaveLength(3);
      expect(store.loading()).toBe(false);
    }));

    it('seta error quando API falha', fakeAsync(() => {
      const { store } = setup({
        getDisponiveis: jest.fn().mockReturnValue(
          throwError(() => new Error('500'))
        ),
      });

      store.loadAulasDisponiveis();
      tick();

      expect(store.error()).toBe('Erro ao carregar aulas disponiveis');
      expect(store.aulasDisponiveis()).toEqual([]);
    }));
  });

  // ── matricular ────────────────────────────────────────────────────────────

  describe('matricular', () => {
    it('adiciona nova matricula em minhasMatriculas', fakeAsync(() => {
      const nova = mkMatricula('m-nova', 'a1');
      const { store } = setup({
        getDisponiveis: jest.fn().mockReturnValue(of([mkAula('a1')])),
        matricular: jest.fn().mockReturnValue(of(nova)),
      });

      store.loadAulasDisponiveis();
      tick();
      store.matricular('a1');
      tick();

      expect(store.minhasMatriculas()).toContainEqual(nova);
    }));

    it('remove a aula de aulasDisponiveis apos matricula', fakeAsync(() => {
      const aulas = [mkAula('a1'), mkAula('a2')];
      const { store } = setup({
        getDisponiveis: jest.fn().mockReturnValue(of(aulas)),
        matricular: jest.fn().mockReturnValue(of(mkMatricula('m1', 'a1'))),
      });

      store.loadAulasDisponiveis();
      tick();

      store.matricular('a1');
      tick();

      const ids = store.aulasDisponiveis().map((a) => a.id);
      expect(ids).not.toContain('a1');
      expect(ids).toContain('a2');
      expect(store.aulasDisponiveis()).toHaveLength(1);
    }));

    it('seta successMessage apos matricula bem-sucedida', fakeAsync(() => {
      const { store } = setup({
        matricular: jest.fn().mockReturnValue(of(mkMatricula('m1', 'a1'))),
      });

      store.matricular('a1');
      tick();

      expect(store.successMessage()).toBe('Matricula realizada com sucesso!');
    }));

    it('seta error e NAO altera listas quando API retorna 409', fakeAsync(() => {
      const err = new HttpErrorResponse({
        error: { message: 'Nao ha vagas disponiveis para esta aula' },
        status: 409,
      });
      const { store } = setup({
        getDisponiveis: jest.fn().mockReturnValue(of([mkAula('a1')])),
        matricular: jest.fn().mockReturnValue(throwError(() => err)),
      });

      store.loadAulasDisponiveis();
      tick();
      store.matricular('a1');
      tick();

      expect(store.error()).toBe('Nao ha vagas disponiveis para esta aula');
      expect(store.aulasDisponiveis()).toHaveLength(1);
      expect(store.minhasMatriculas()).toHaveLength(0);
      expect(store.loading()).toBe(false);
    }));

    it('usa mensagem generica quando erro nao tem body', fakeAsync(() => {
      const { store } = setup({
        matricular: jest.fn().mockReturnValue(
          throwError(() => new HttpErrorResponse({ status: 500 }))
        ),
      });

      store.matricular('a-qualquer');
      tick();

      expect(store.error()).toBe('Erro ao realizar matricula');
    }));
  });

  // ── cancelarMatricula ─────────────────────────────────────────────────────

  describe('cancelarMatricula', () => {
    it('remove matricula da lista apos cancelamento', fakeAsync(() => {
      const matriculas = [mkMatricula('m1', 'a1'), mkMatricula('m2', 'a2')];
      const { store } = setup({
        getMinhas: jest.fn().mockReturnValue(of(matriculas)),
        cancelar: jest.fn().mockReturnValue(of(undefined)),
      });

      store.loadMinhasMatriculas();
      tick();
      expect(store.minhasMatriculas()).toHaveLength(2);

      store.cancelarMatricula('m1');
      tick();

      expect(store.minhasMatriculas()).toHaveLength(1);
      expect(store.minhasMatriculas()[0].id).toBe('m2');
    }));

    it('mantém lista inalterada quando API de cancelar falhar', fakeAsync(() => {
      const matriculas = [mkMatricula('m1', 'a1')];
      const { store } = setup({
        getMinhas: jest.fn().mockReturnValue(of(matriculas)),
        cancelar: jest.fn().mockReturnValue(
          throwError(() => new Error('500'))
        ),
      });

      store.loadMinhasMatriculas();
      tick();
      store.cancelarMatricula('m1');
      tick();

      expect(store.minhasMatriculas()).toHaveLength(1);
    }));
  });

  // ── clearMessages ─────────────────────────────────────────────────────────

  describe('clearMessages', () => {
    it('limpa error e successMessage', fakeAsync(() => {
      const { store } = setup({
        matricular: jest.fn().mockReturnValue(
          throwError(() => new HttpErrorResponse({
            error: { message: 'Sem vagas' }, status: 409,
          }))
        ),
      });

      store.matricular('a1');
      tick();
      expect(store.error()).toBe('Sem vagas');

      store.clearMessages();

      expect(store.error()).toBeNull();
      expect(store.successMessage()).toBeNull();
    }));

    it('limpa successMessage apos matricula bem-sucedida', fakeAsync(() => {
      const { store } = setup({
        matricular: jest.fn().mockReturnValue(of(mkMatricula('m1', 'a1'))),
      });

      store.matricular('a1');
      tick();
      expect(store.successMessage()).toBe('Matricula realizada com sucesso!');

      store.clearMessages();

      expect(store.successMessage()).toBeNull();
    }));
  });
});
