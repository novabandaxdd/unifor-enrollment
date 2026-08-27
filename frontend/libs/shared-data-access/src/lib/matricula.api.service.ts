import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from './environment.token';
import { AulaResponse, MatriculaResponse } from './models';

@Injectable({ providedIn: 'root' })
export class MatriculaApiService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  private get baseUrl(): string {
    return this.env.apiUrl;
  }

  getMinhas(): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(
      `${this.baseUrl}/api/v1/matricula/minhas`
    );
  }

  getDisponiveis(): Observable<AulaResponse[]> {
    return this.http.get<AulaResponse[]>(
      `${this.baseUrl}/api/v1/matriz/disponiveis`
    );
  }

  matricular(aulaMatrizId: string): Observable<MatriculaResponse> {
    return this.http.post<MatriculaResponse>(
      `${this.baseUrl}/api/v1/matricula`,
      { aulaMatrizId }
    );
  }

  cancelar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/matricula/${id}`);
  }
}
