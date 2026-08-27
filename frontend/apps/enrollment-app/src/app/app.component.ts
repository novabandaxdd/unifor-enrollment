import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Button],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="brand-link">
          🎓 Unifor Enrollment
        </a>
      </div>

      <div class="navbar-links">
        @if (authService.isCoordinator()) {
          <a routerLink="/matriz" class="nav-link">Matriz Curricular</a>
        }
        @if (authService.isStudent()) {
          <a routerLink="/matricula/disponiveis" class="nav-link">Aulas Disponíveis</a>
          <a routerLink="/matricula/minhas" class="nav-link">Minhas Matrículas</a>
        }
      </div>

      <div class="navbar-actions">
        <p-button
          label="Sair"
          icon="pi pi-sign-out"
          severity="secondary"
          size="small"
          (onClick)="authService.logout()"
        />
      </div>
    </nav>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        background-color: #1e3a5f;
        color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .brand-link {
        color: #fff;
        font-size: 1.2rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 0.5px;
      }

      .navbar-links {
        display: flex;
        gap: 1.5rem;
      }

      .nav-link {
        color: #c8d8ed;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        transition: color 0.2s;
      }

      .nav-link:hover {
        color: #fff;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .main-content {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {
  authService = inject(AuthService);
  title = 'enrollment-app';
}
