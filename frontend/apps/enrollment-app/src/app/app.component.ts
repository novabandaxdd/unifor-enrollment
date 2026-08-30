import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Button, Tag],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="brand-link">
          🎓 Unifor Enrollment
        </a>
      </div>

      <div class="navbar-links">
        @if (authService.isCoordinator()) {
          <a routerLink="/matriz" class="nav-link">
            <i class="pi pi-list"></i> Matriz Curricular
          </a>
        }
        @if (authService.isStudent()) {
          <a routerLink="/matricula/disponiveis" class="nav-link">
            <i class="pi pi-search"></i> Aulas Disponíveis
          </a>
          <a routerLink="/matricula/minhas" class="nav-link">
            <i class="pi pi-bookmark"></i> Minhas Matrículas
          </a>
        }
      </div>

      <div class="navbar-actions">
        <div class="user-info">
          <i class="pi pi-user user-icon"></i>
          <span class="user-name">{{ authService.getUsername() }}</span>
          @if (authService.isCoordinator()) {
            <p-tag value="Coordenador" severity="info" class="role-tag" />
          }
          @if (authService.isStudent()) {
            <p-tag value="Aluno" severity="success" class="role-tag" />
          }
        </div>
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        gap: 1rem;
      }

      .brand-link {
        color: #fff;
        font-size: 1.2rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .navbar-links {
        display: flex;
        gap: 1.5rem;
        flex: 1;
        justify-content: center;
      }

      .nav-link {
        color: #c8d8ed;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .nav-link:hover {
        color: #fff;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #c8d8ed;
        font-size: 0.88rem;
      }

      .user-icon {
        font-size: 1rem;
      }

      .user-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .role-tag {
        font-size: 0.7rem;
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
