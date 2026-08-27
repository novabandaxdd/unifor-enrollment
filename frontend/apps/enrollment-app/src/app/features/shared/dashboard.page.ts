import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">
        Bem-vindo, {{ authService.getUsername() }}!
      </h1>

      @if (authService.isCoordinator()) {
        <div class="cards-grid">
          <p-card header="Matriz Curricular" subheader="Gerencie as aulas do semestre">
            <p>Crie, edite e exclua aulas da matriz curricular do seu curso.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Acessar Matriz"
                icon="pi pi-list"
                routerLink="/matriz"
              />
            </ng-template>
          </p-card>
        </div>
      }

      @if (authService.isStudent()) {
        <div class="cards-grid">
          <p-card header="Aulas Disponíveis" subheader="Realize sua matrícula">
            <p>Veja as aulas disponíveis para o seu curso e realize sua matrícula.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Ver Aulas"
                icon="pi pi-search"
                routerLink="/matricula/disponiveis"
              />
            </ng-template>
          </p-card>

          <p-card header="Minhas Matrículas" subheader="Acompanhe suas matrículas">
            <p>Visualize todas as aulas em que você está matriculado.</p>
            <ng-template pTemplate="footer">
              <p-button
                label="Minhas Matrículas"
                icon="pi pi-bookmark"
                severity="secondary"
                routerLink="/matricula/minhas"
              />
            </ng-template>
          </p-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1rem 0;
    }
    .dashboard-title {
      font-size: 1.6rem;
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 1.5rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
  `],
})
export class DashboardPage {
  authService = inject(AuthService);
}
