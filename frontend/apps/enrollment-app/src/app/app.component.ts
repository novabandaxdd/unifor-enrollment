import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button],
  template: `
    <header class="topbar">
      <div class="topbar-inner">

        <a routerLink="/dashboard" class="brand">
          <div class="brand-logo">U</div>
          <div class="brand-text">
            <span class="brand-name">Unifor</span>
            <span class="brand-sub">Matriculas</span>
          </div>
        </a>

        <nav class="nav-links">
          @if (auth.isCoordinator()) {
            <a routerLink="/matriz" routerLinkActive="nav-active" class="nav-link">
              <i class="pi pi-th-large"></i>
              <span>Matriz Curricular</span>
            </a>
          }
          @if (auth.isStudent()) {
            <a routerLink="/matricula/disponiveis" routerLinkActive="nav-active" class="nav-link">
              <i class="pi pi-calendar"></i>
              <span>Aulas Disponiveis</span>
            </a>
            <a routerLink="/matricula/minhas" routerLinkActive="nav-active" class="nav-link">
              <i class="pi pi-bookmark"></i>
              <span>Minhas Matriculas</span>
            </a>
          }
        </nav>

        <div class="topbar-right">
          <div class="user-pill">
            <div class="user-avatar">
              {{ getInitials(auth.getUsername()) }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ auth.getUsername() }}</span>
              <span class="user-role" [class.role-coord]="auth.isCoordinator()" [class.role-aluno]="auth.isStudent()">
                {{ auth.isCoordinator() ? 'Coordenador' : 'Aluno' }}
              </span>
            </div>
          </div>

          <button class="logout-btn" (click)="auth.logout()" title="Sair">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>

      </div>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .topbar {
      height: 60px;
      background: #111827;
      border-bottom: 1px solid #1f2937;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-inner {
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      gap: 2rem;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-logo {
      width: 32px; height: 32px;
      background: #2563eb;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 800; color: white;
    }
    .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
    .brand-name { font-size: 0.95rem; font-weight: 700; color: white; }
    .brand-sub { font-size: 0.68rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Nav */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover {
      background: #1f2937;
      color: #f9fafb;
    }
    .nav-link.nav-active {
      background: #1e40af;
      color: white;
    }
    .nav-link .pi { font-size: 0.85rem; }

    /* Right side */
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
      margin-left: auto;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #1f2937;
      border-radius: 8px;
      padding: 0.35rem 0.75rem 0.35rem 0.4rem;
    }
    .user-avatar {
      width: 28px; height: 28px;
      background: #374151;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #d1d5db;
    }
    .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 0.82rem; font-weight: 600; color: #f9fafb; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { font-size: 0.68rem; font-weight: 500; }
    .role-coord { color: #60a5fa; }
    .role-aluno { color: #34d399; }

    .logout-btn {
      width: 36px; height: 36px;
      background: transparent;
      border: 1px solid #374151;
      border-radius: 6px;
      color: #9ca3af;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      font-size: 0.9rem;
    }
    .logout-btn:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
    }

    /* Main */
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.75rem 1.5rem;
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  title = 'enrollment-app';

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
