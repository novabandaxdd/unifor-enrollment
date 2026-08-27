import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from './environment.token';
import {
  AulaResponse,
  CriarAulaRequest,
  Curso,
  Disciplina,
  EditarAulaRequest,
  Horario,
  Professor,
} from './models';

@Injectable({ providedIn: 'root' })
export class MatrizApiService {
  private http = inject(HttpClient);
  private baseUrl = inject(ENVIRONMENT).apiUrl;

  listar(filtros?: {
    periodo?: string;
    cursoId?: string;
    maxAlunos?: number;
  }): Observable<AulaResponse[]> {
    let params = new HttpParams();
    if (filtros?.periodo) params = params.set('periodo', filtros.periodo);
    if (filtros?.cursoId) params = params.set('cursoId', filtros.cursoId);
    if (filtros?.maxAlunos != null)
      params = params.set('maxAlunos', filtros.maxAlunos.toString());
    return this.http.get<AulaResponse[]>(`${this.baseUrl}/api/v1/matriz`, {
      params,
    });
  }

  criar(request: CriarAulaRequest): Observable<AulaResponse> {
    return this.http.post<AulaResponse>(
      `${this.baseUrl}/api/v1/matriz`,
      request,
    );
  }

  editar(id: string, request: EditarAulaRequest): Observable<AulaResponse> {
    return this.http.patch<AulaResponse>(
      `${this.baseUrl}/api/v1/matriz/${id}`,
      request,
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/matriz/${id}`);
  }

  getDisciplinas(): Observable<Disciplina[]> {
    return this.http.get<Disciplina[]>(
      `${this.baseUrl}/api/v1/referencias/disciplinas`,
    );
  }

  getProfessores(): Observable<Professor[]> {
    return this.http.get<Professor[]>(
      `${this.baseUrl}/api/v1/referencias/professores`,
    );
  }

  getHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(
      `${this.baseUrl}/api/v1/referencias/horarios`,
    );
  }

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(
      `${this.baseUrl}/api/v1/referencias/cursos`,
    );
  }
}
