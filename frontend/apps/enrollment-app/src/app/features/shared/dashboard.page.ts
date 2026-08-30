import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Card, Button, Tag],
  template: `
    <div class="dashboard-container">
      <div class="welcome-header">
        <div>
          <h1 class="dashboard-title">
            Olá, {{ authService.getUsername() }} 👋
          </h1>
          <p class="welcome-subtitle">
            Sistema de Matrículas — Unifor · Semestre 2025.1
          </p>
        </div>
        <div class="role-badge-wrap">
          @if (authService.isCoordinator()) {
            <p-tag value="Coordenador" severity="info" icon="pi pi-user" />
          }
          @if (authService.isStudent()) {
            <p-tag value="Aluno" severity="success" icon="pi pi-graduation-cap" />
          }
        </div>
      </div>

      @if (authService.isCoordinator()) {
        <div class="cards-grid">
          <p-card styleClass="action-card">
            <div class="card-icon-wrap">
              <i class="pi pi-list card-icon coordinator"></i>
            </div>
            <h3 class="action-card-title">Matriz Curricular</h3>
            <p class="action-card-desc">
              Gerencie as aulas do semestre: crie, edite e exclua aulas da matriz curricular.
            </p>
            <p-button
              label="Acessar Matriz"
              icon="pi pi-arrow-right"
              iconPos="right"
              routerLink="/matriz"
              styleClass="w-full"
            />
          </p-card>
        </div>
      }

      @if (authService.isStudent()) {
        <div class="cards-grid">
          <p-card styleClass="action-card">
            <div class="card-icon-wrap">
              <i class="pi pi-search card-icon student"></i>
            </div>
            <h3 class="action-card-title">Aulas Disponíveis</h3>
            <p class="action-card-desc">
              Veja as aulas disponíveis para o seu curso e realize sua matrícula.
            </p>
            <p-button
              label="Ver Aulas"
              icon="pi pi-arrow-right"
              iconPos="right"
              routerLink="/matricula/disponiveis"
              styleClass="w-full"
            />
          </p-card>

          <p-card styleClass="action-card">
            <div class="card-icon-wrap">
              <i class="pi pi-bookmark card-icon student-alt"></i>
            </div>
            <h3 class="action-card-title">Minhas Matrículas</h3>
            <p class="action-card-desc">
              Visualize todas as aulas em que você está matriculado e cancele se necessário.
            </p>
            <p-button
              label="Minhas Matrículas"
              icon="pi pi-arrow-right"
              iconPos="right"
              severity="secondary"
              routerLink="/matricula/minhas"
              styleClass="w-full"
            />
          </p-card>
        </div>
      }

      <div class="info-footer">
        <i class="pi pi-info-circle"></i>
        Dúvidas? Entre em contato com a coordenação do seu curso.
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .dashboard-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1e3a5f;
      margin: 0 0 0.25rem;
    }

    .welcome-subtitle {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0;
    }

    .role-badge-wrap {
      padding-top: 0.25rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    :host ::ng-deep .action-card .p-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card-icon-wrap {
      display: flex;
      justify-content: center;
      padding: 1rem 0 0.5rem;
    }

    .card-icon {
      font-size: 2.5rem;
    }

    .card-icon.coordinator { color: #3b82f6; }
    .card-icon.student { color: #10b981; }
    .card-icon.student-alt { color: #f59e0b; }

    .action-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a5f;
      margin: 0;
      text-align: center;
    }

    .action-card-desc {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
      text-align: center;
      min-height: 2.5rem;
    }

    .info-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #9ca3af;
      padding-top: 0.5rem;
    }
  `],
})
export class DashboardPage {
  authService = inject(AuthService);
}
