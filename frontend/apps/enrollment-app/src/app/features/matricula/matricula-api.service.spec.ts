/**
 * MatriculaApiService — Testes Unitarios com HttpClientTestingModule
 *
 * Cobre:
 * - getMinhas: GET /api/v1/matricula/minhas
 * - getDisponiveis: GET /api/v1/matricula/disponiveis
 * - matricular: POST /api/v1/matricula com aulaMatrizId no body
 * - cancelar: DELETE /api/v1/matricula/:id (204)
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  MatriculaApiService,
  ENVIRONMENT,
  AulaResponse,
  MatriculaResponse,
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
  maxAlunos: 30,
  vagasDisponiveis: 10,
  ativo: true,
};

const mockMatricula: MatriculaResponse = {
  id: 'mat-1',
  aulaMatriz: mockAula,
  dataMatricula: '2025-01-15T10:00:00',
  ativo: true,
};

// ── Setup ─────────────────────────────────────────────────────────────────────

let service: MatriculaApiService;
let http: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ENVIRONMENT, useValue: { apiUrl: API } },
      MatriculaApiService,
    ],
  });
  service = TestBed.inject(MatriculaApiService);
  http = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  http.verify();
  TestBed.resetTestingModule();
});

// ── Testes ────────────────────────────────────────────────────────────────────

describe('MatriculaApiService', () => {

  describe('getMinhas', () => {
    it('GET /api/v1/matricula/minhas retorna lista de MatriculaResponse', () => {
      const result: MatriculaResponse[] = [];

      service.getMinhas().subscribe((d) => result.push(...d));
      http.expectOne(`${API}/api/v1/matricula/minhas`).flush([mockMatricula]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('mat-1');
    });
  });

  describe('getDisponiveis', () => {
    it('GET /api/v1/matricula/disponiveis retorna lista de AulaResponse', () => {
      const result: AulaResponse[] = [];

      service.getDisponiveis().subscribe((d) => result.push(...d));
      http.expectOne(`${API}/api/v1/matricula/disponiveis`).flush([mockAula]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('aula-1');
    });
  });

  describe('matricular', () => {
    it('POST /api/v1/matricula com aulaMatrizId no body', () => {
      let response: MatriculaResponse | null = null;

      service.matricular('aula-1').subscribe((d) => (response = d));

      const req = http.expectOne(`${API}/api/v1/matricula`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ aulaMatrizId: 'aula-1' });
      req.flush(mockMatricula);

      expect(response).not.toBeNull();
      expect((response as MatriculaResponse | null)?.id).toBe('mat-1');
    });
  });

  describe('cancelar', () => {
    it('DELETE /api/v1/matricula/:id retorna 204', () => {
      service.cancelar('mat-1').subscribe();

      const req = http.expectOne(`${API}/api/v1/matricula/mat-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
