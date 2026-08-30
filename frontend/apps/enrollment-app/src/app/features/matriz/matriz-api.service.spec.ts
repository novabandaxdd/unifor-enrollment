/**
 * MatrizApiService — Testes Unitarios com HttpClientTestingModule
 *
 * Cobre:
 * - listar: GET sem filtros (sem query params)
 * - listar: GET com filtro de periodo
 * - listar: GET com todos os filtros combinados
 * - criar: POST com payload completo
 * - editar: PATCH no endpoint correto
 * - excluir: DELETE no endpoint correto (204)
 * - getDisciplinas, getProfessores, getHorarios, getCursos
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  MatrizApiService,
  ENVIRONMENT,
  AulaResponse,
  CriarAulaRequest,
} from '@unifor/shared-data-access';

const API = 'http://localhost:8080';

const mockAula: AulaResponse = {
  id: 'aula-1',
  disciplina: { id: 'd1', nome: 'Algoritmos', cargaHoraria: 80 },
  professor: { id: 'p1', nome: 'Dr. Roberto', email: 'r@unifor.br' },
  horario: {
    id: 'h1', diaSemana: 'SEG',
    horaInicio: '08:00:00', horaFim: '10:00:00', periodo: 'MANHA',
  },
  cursosAutorizados: [{ id: 'c1', nome: 'CC' }],
  maxAlunos: 40,
  vagasDisponiveis: 35,
  ativo: true,
};

// ── Setup ─────────────────────────────────────────────────────────────────────

let service: MatrizApiService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ENVIRONMENT, useValue: { apiUrl: API } },
      MatrizApiService,
    ],
  });
  service = TestBed.inject(MatrizApiService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  http.verify();
  TestBed.resetTestingModule();
});

// ── Testes ────────────────────────────────────────────────────────────────────

describe('MatrizApiService', () => {

  // ── listar ────────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('GET /api/v1/matriz sem query params quando sem filtros', () => {
      service.listar().subscribe();

      const req = http.expectOne(`${API}/api/v1/matriz`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush([mockAula]);
    });

    it('inclui ?periodo=MANHA quando filtro informado', () => {
      service.listar({ periodo: 'MANHA' }).subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${API}/api/v1/matriz` &&
          r.params.get('periodo') === 'MANHA'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('inclui todos os filtros como query params', () => {
      service.listar({
        periodo: 'TARDE', cursoId: 'c1', maxAlunos: 40, horarioId: 'h1',
      }).subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${API}/api/v1/matriz` &&
          r.params.get('periodo') === 'TARDE' &&
          r.params.get('cursoId') === 'c1' &&
          r.params.get('maxAlunos') === '40' &&
          r.params.get('horarioId') === 'h1'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockAula]);
    });

    it('retorna lista de AulaResponse da API', () => {
      const result: AulaResponse[] = [];

      service.listar().subscribe((data) => result.push(...data));
      http.expectOne(`${API}/api/v1/matriz`).flush([mockAula]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('aula-1');
    });
  });

  // ── criar ─────────────────────────────────────────────────────────────────

  describe('criar', () => {
    it('POST /api/v1/matriz com payload completo', () => {
      const payload: CriarAulaRequest = {
        disciplinaId: 'd1', professorId: 'p1', horarioId: 'h1',
        cursosAutorizadosIds: ['c1', 'c2'], maxAlunos: 40,
      };

      service.criar(payload).subscribe();

      const req = http.expectOne(`${API}/api/v1/matriz`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockAula);
    });
  });

  // ── editar ────────────────────────────────────────────────────────────────

  describe('editar', () => {
    it('PATCH /api/v1/matriz/:id com payload parcial', () => {
      const body = { professorId: 'p2' };

      service.editar('aula-1', body).subscribe();

      const req = http.expectOne(`${API}/api/v1/matriz/aula-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush(mockAula);
    });
  });

  // ── excluir ───────────────────────────────────────────────────────────────

  describe('excluir', () => {
    it('DELETE /api/v1/matriz/:id retorna 204', () => {
      service.excluir('aula-1').subscribe();

      const req = http.expectOne(`${API}/api/v1/matriz/aula-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  // ── Referencias ───────────────────────────────────────────────────────────

  it('GET /api/v1/referencias/disciplinas', () => {
    service.getDisciplinas().subscribe();

    const req = http.expectOne(`${API}/api/v1/referencias/disciplinas`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('GET /api/v1/referencias/professores', () => {
    service.getProfessores().subscribe();

    const req = http.expectOne(`${API}/api/v1/referencias/professores`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('GET /api/v1/referencias/cursos', () => {
    service.getCursos().subscribe();

    const req = http.expectOne(`${API}/api/v1/referencias/cursos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('GET /api/v1/referencias/horarios', () => {
    service.getHorarios().subscribe();

    const req = http.expectOne(`${API}/api/v1/referencias/horarios`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
