import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule],
  template: `
    <div class="dashboard">
      <h1 class="dashboard-title">Bem-vindo ao Unifor Enrollment</h1>
      <p class="dashboard-subtitle">
        Sistema de gestão de matrículas acadêmicas da Universidade de Fortaleza.
      </p>

      <div class="cards-grid">
        @if (authService.isCoordinator()) {
          <p-card header="Matriz Curricular" styleClass="dashboard-card">
            <p>Gerencie as aulas, professores e horários da grade curricular.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Acessar"
                icon="pi pi-table"
                routerLink="/matriz"
              />
            </ng-template>
          </p-card>
        }

        @if (authService.isStudent()) {
          <p-card header="Aulas Disponíveis" styleClass="dashboard-card">
            <p>Visualize as aulas disponíveis para o seu curso e realize matrículas.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Acessar"
                icon="pi pi-list"
                routerLink="/matricula/disponiveis"
              />
            </ng-template>
          </p-card>

          <p-card header="Minhas Matrículas" styleClass="dashboard-card">
            <p>Consulte e gerencie suas matrículas ativas neste semestre.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Acessar"
                icon="pi pi-bookmark"
                routerLink="/matricula/minhas"
              />
            </ng-template>
          </p-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 1rem 0;
      }

      .dashboard-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e3a5f;
        margin: 0 0 0.5rem;
      }

      .dashboard-subtitle {
        color: #6b7280;
        margin: 0 0 2rem;
        font-size: 1rem;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        max-width: 900px;
      }

      .dashboard-card {
        border: 1px solid #e5e7eb;
      }
    `,
  ],
})
export class DashboardPage {
  authService = inject(AuthService);
}
