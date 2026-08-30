import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Button],
  template: `
    <div class="dashboard">

      <!-- Welcome -->
      <div class="welcome-section">
        <div class="welcome-avatar">{{ getInitials(auth.getUsername()) }}</div>
        <div class="welcome-text">
          <h1 class="welcome-title">Bom dia, {{ auth.getUsername() }}</h1>
          <p class="welcome-sub">Semestre 2025.1 - Sistema de Matriculas Unifor</p>
        </div>
      </div>

      <!-- Coordinator Cards -->
      @if (auth.isCoordinator()) {
        <div class="section-label">
          <i class="pi pi-briefcase"></i> Painel do Coordenador
        </div>
        <div class="cards-grid">

          <div class="action-card card-blue">
            <div class="card-top">
              <div class="card-icon-box">
                <i class="pi pi-th-large"></i>
              </div>
              <div class="card-badge">Coordenador</div>
            </div>
            <h3 class="card-title">Matriz Curricular</h3>
            <p class="card-desc">Gerencie as aulas do semestre: crie, edite horarios, professores e cursos autorizados.</p>
            <a routerLink="/matriz" class="card-cta">
              Acessar Matriz <i class="pi pi-arrow-right"></i>
            </a>
          </div>

        </div>
      }

      <!-- Student Cards -->
      @if (auth.isStudent()) {
        <div class="section-label">
          <i class="pi pi-graduation-cap"></i> Painel do Aluno
        </div>
        <div class="cards-grid">

          <div class="action-card card-green">
            <div class="card-top">
              <div class="card-icon-box">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="card-badge">Disponivel</div>
            </div>
            <h3 class="card-title">Aulas Disponiveis</h3>
            <p class="card-desc">Veja as aulas disponiveis para o seu curso e realize sua matricula com um clique.</p>
            <a routerLink="/matricula/disponiveis" class="card-cta">
              Ver Aulas <i class="pi pi-arrow-right"></i>
            </a>
          </div>

          <div class="action-card card-purple">
            <div class="card-top">
              <div class="card-icon-box">
                <i class="pi pi-bookmark"></i>
              </div>
              <div class="card-badge">Minhas</div>
            </div>
            <h3 class="card-title">Minhas Matriculas</h3>
            <p class="card-desc">Acompanhe todas as aulas em que esta matriculado e cancele quando necessario.</p>
            <a routerLink="/matricula/minhas" class="card-cta">
              Ver Matriculas <i class="pi pi-arrow-right"></i>
            </a>
          </div>

        </div>

        <!-- Quick Tips -->
        <div class="tips-bar">
          <i class="pi pi-info-circle"></i>
          <span>Dica: Ao se matricular, o sistema valida automaticamente conflitos de horario e disponibilidade de vagas em tempo real.</span>
        </div>
      }

    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.75rem; }

    /* Welcome */
    .welcome-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }
    .welcome-avatar {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .welcome-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
    .welcome-sub { font-size: 0.88rem; color: #9ca3af; margin: 0.2rem 0 0; }

    /* Section label */
    .section-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Cards */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .action-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .action-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }

    .card-icon-box {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon-box .pi { font-size: 1.2rem; }

    .card-blue .card-icon-box { background: #dbeafe; color: #2563eb; }
    .card-green .card-icon-box { background: #dcfce7; color: #16a34a; }
    .card-purple .card-icon-box { background: #ede9fe; color: #7c3aed; }

    .card-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.55rem;
      border-radius: 99px;
      color: #6b7280;
      background: #f3f4f6;
    }

    .card-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
    .card-desc { font-size: 0.86rem; color: #6b7280; line-height: 1.5; margin: 0; flex: 1; }

    .card-cta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.86rem;
      font-weight: 600;
      text-decoration: none;
      margin-top: 0.25rem;
    }
    .card-blue .card-cta { color: #2563eb; }
    .card-green .card-cta { color: #16a34a; }
    .card-purple .card-cta { color: #7c3aed; }
    .card-cta:hover .pi { transform: translateX(3px); transition: transform 0.15s; }

    /* Tips */
    .tips-bar {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      color: #92400e;
      line-height: 1.5;
    }
    .tips-bar .pi { margin-top: 1px; flex-shrink: 0; }
  `],
})
export class DashboardPage {
  auth = inject(AuthService);

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
