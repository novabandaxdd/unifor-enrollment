/**
 * MatrizStore — Testes Unitarios
 *
 * Cobre:
 * - Estado inicial
 * - loadAulas: sucesso, erro e passagem de filtros
 * - loadReferencias: forkJoin carrega disciplinas/professores/horarios/cursos
 * - criarAula: adiciona aula ao estado
 * - editarAula: substitui aula editada, mantém demais
 * - excluirAula: remove aula da lista
 * - clearError: limpa campo de erro
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import {
  MatrizStore,
  MatrizApiService,
  ENVIRONMENT,
  AulaResponse,
} from '@unifor/shared-data-access';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mkAula = (id: string): AulaResponse => ({
  id,
  disciplina: { id: 'd1', nome: 'Algoritmos', cargaHoraria: 80 },
  professor: { id: 'p1', nome: 'Dr. Roberto', email: 'r@unifor.br' },
  horario: {
    id: 'h1', diaSemana: 'SEG',
    horaInicio: '08:00:00', horaFim: '10:00:00', periodo: 'MANHA',
  },
  cursosAutorizados: [{ id: 'c1', nome: 'CC' }],
  maxAlunos: 40,
  vagasDisponiveis: 40,
  ativo: true,
});

const refs = {
  disciplinas: [{ id: 'd1', nome: 'Algoritmos', cargaHoraria: 80 }],
  professores: [{ id: 'p1', nome: 'Dr. Roberto', email: 'r@unifor.br' }],
  horarios: [{
    id: 'h1', diaSemana: 'SEG',
    horaInicio: '08:00', horaFim: '10:00', periodo: 'MANHA',
  }],
  cursos: [{ id: 'c1', nome: 'Ciencia da Computacao' }],
};

// ── Setup ─────────────────────────────────────────────────────────────────────

function buildApi(
  overrides: Partial<jest.Mocked<MatrizApiService>> = {}
): jest.Mocked<MatrizApiService> {
  return {
    listar: jest.fn().mockReturnValue(of([])),
    criar: jest.fn().mockReturnValue(of(mkAula('new'))),
    editar: jest.fn().mockReturnValue(of(mkAula('a1'))),
    excluir: jest.fn().mockReturnValue(of(undefined)),
    getDisciplinas: jest.fn().mockReturnValue(of(refs.disciplinas)),
    getProfessores: jest.fn().mockReturnValue(of(refs.professores)),
    getHorarios: jest.fn().mockReturnValue(of(refs.horarios)),
    getCursos: jest.fn().mockReturnValue(of(refs.cursos)),
    ...overrides,
  } as unknown as jest.Mocked<MatrizApiService>;
}

function setup(overrides: Partial<jest.Mocked<MatrizApiService>> = {}) {
  const api = buildApi(overrides);
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      { provide: ENVIRONMENT, useValue: { apiUrl: 'http://localhost:8080' } },
      { provide: MatrizApiService, useValue: api },
    ],
  });
  return { store: TestBed.inject(MatrizStore), api };
}

afterEach(() => TestBed.resetTestingModule());

// ── Testes ────────────────────────────────────────────────────────────────────

describe('MatrizStore', () => {

  describe('estado inicial', () => {
    it('deve ter listas vazias, loading=false e sem erro', () => {
      const { store } = setup();
      expect(store.aulas()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.disciplinas()).toEqual([]);
      expect(store.professores()).toEqual([]);
      expect(store.horarios()).toEqual([]);
      expect(store.cursos()).toEqual([]);
    });
  });

  // ── loadAulas ─────────────────────────────────────────────────────────────

  describe('loadAulas', () => {
    it('preenche aulas sem filtros', fakeAsync(() => {
      const data = [mkAula('a1'), mkAula('a2')];
      const { store, api } = setup({
        listar: jest.fn().mockReturnValue(of(data)),
      });

      store.loadAulas();
      tick();

      expect(api.listar).toHaveBeenCalledWith(undefined);
      expect(store.aulas()).toHaveLength(2);
      expect(store.loading()).toBe(false);
    }));

    it('passa filtros corretamente para a API', fakeAsync(() => {
      const filtros = { periodo: 'MANHA', cursoId: 'c1', maxAlunos: 40 };
      const { store, api } = setup();

      store.loadAulas(filtros);
      tick();

      expect(api.listar).toHaveBeenCalledWith(filtros);
    }));

    it('seta error quando API falha', fakeAsync(() => {
      const { store } = setup({
        listar: jest.fn().mockReturnValue(throwError(() => new Error('404'))),
      });

      store.loadAulas();
      tick();

      expect(store.error()).toBe('Erro ao carregar aulas');
      expect(store.loading()).toBe(false);
    }));
  });

  // ── loadReferencias ───────────────────────────────────────────────────────

  describe('loadReferencias', () => {
    it('carrega disciplinas, professores, horarios e cursos em paralelo', fakeAsync(() => {
      const { store, api } = setup();

      store.loadReferencias();
      tick();

      expect(api.getDisciplinas).toHaveBeenCalledTimes(1);
      expect(api.getProfessores).toHaveBeenCalledTimes(1);
      expect(api.getHorarios).toHaveBeenCalledTimes(1);
      expect(api.getCursos).toHaveBeenCalledTimes(1);

      expect(store.disciplinas()).toHaveLength(1);
      expect(store.professores()).toHaveLength(1);
      expect(store.horarios()).toHaveLength(1);
      expect(store.cursos()).toHaveLength(1);
      expect(store.cursos()[0].nome).toBe('Ciencia da Computacao');
    }));
  });

  // ── criarAula ─────────────────────────────────────────────────────────────

  describe('criarAula', () => {
    it('adiciona nova aula ao estado', fakeAsync(() => {
      const nova = { ...mkAula('new-id'), id: 'new-id' };
      const { store } = setup({
        listar: jest.fn().mockReturnValue(of([mkAula('a1')])),
        criar: jest.fn().mockReturnValue(of(nova)),
      });

      store.loadAulas();
      tick();
      expect(store.aulas()).toHaveLength(1);

      store.criarAula({
        disciplinaId: 'd1', professorId: 'p1', horarioId: 'h1',
        cursosAutorizadosIds: ['c1'], maxAlunos: 40,
      });
      tick();

      expect(store.aulas()).toHaveLength(2);
      expect(store.aulas().find((a) => a.id === 'new-id')).toBeDefined();
      expect(store.loading()).toBe(false);
    }));

    it('seta error quando criacao falha', fakeAsync(() => {
      const { store } = setup({
        criar: jest.fn().mockReturnValue(throwError(() => new Error('409'))),
      });

      store.criarAula({
        disciplinaId: 'd1', professorId: 'p1', horarioId: 'h1',
        cursosAutorizadosIds: ['c1'], maxAlunos: 40,
      });
      tick();

      expect(store.error()).toBe('Erro ao criar aula');
      expect(store.loading()).toBe(false);
    }));
  });

  // ── editarAula ────────────────────────────────────────────────────────────

  describe('editarAula', () => {
    it('substitui aula editada mantendo as demais', fakeAsync(() => {
      const original = mkAula('a1');
      const editada = {
        ...original,
        professor: { id: 'p2', nome: 'Dra. Fernanda', email: 'f@unifor.br' },
      };
      const { store } = setup({
        listar: jest.fn().mockReturnValue(of([original, mkAula('a2')])),
        editar: jest.fn().mockReturnValue(of(editada)),
      });

      store.loadAulas();
      tick();

      store.editarAula({ id: 'a1', request: { professorId: 'p2' } });
      tick();

      const atualizada = store.aulas().find((a) => a.id === 'a1');
      expect(atualizada?.professor.nome).toBe('Dra. Fernanda');
      expect(store.aulas()).toHaveLength(2);
    }));

    it('seta error quando edicao falha', fakeAsync(() => {
      const { store } = setup({
        editar: jest.fn().mockReturnValue(throwError(() => new Error('404'))),
      });

      store.editarAula({ id: 'a1', request: { professorId: 'p2' } });
      tick();

      expect(store.error()).toBe('Erro ao editar aula');
    }));
  });

  // ── excluirAula ───────────────────────────────────────────────────────────

  describe('excluirAula', () => {
    it('remove aula da lista apos exclusao', fakeAsync(() => {
      const { store } = setup({
        listar: jest.fn().mockReturnValue(of([mkAula('a1'), mkAula('a2')])),
        excluir: jest.fn().mockReturnValue(of(undefined)),
      });

      store.loadAulas();
      tick();
      expect(store.aulas()).toHaveLength(2);

      store.excluirAula('a1');
      tick();

      expect(store.aulas()).toHaveLength(1);
      expect(store.aulas()[0].id).toBe('a2');
    }));

    it('seta error quando exclusao falha (ex: alunos matriculados)', fakeAsync(() => {
      const { store } = setup({
        listar: jest.fn().mockReturnValue(of([mkAula('a1')])),
        excluir: jest.fn().mockReturnValue(throwError(() => new Error('409'))),
      });

      store.loadAulas();
      tick();
      store.excluirAula('a1');
      tick();

      expect(store.error()).toBe('Erro ao excluir aula');
      expect(store.aulas()).toHaveLength(1);
    }));
  });

  // ── clearError ────────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('limpa o campo error', fakeAsync(() => {
      const { store } = setup({
        listar: jest.fn().mockReturnValue(throwError(() => new Error('net'))),
      });

      store.loadAulas();
      tick();
      expect(store.error()).toBe('Erro ao carregar aulas');

      store.clearError();

      expect(store.error()).toBeNull();
    }));
  });
});
