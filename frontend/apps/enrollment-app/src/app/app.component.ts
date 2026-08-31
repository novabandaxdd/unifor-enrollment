import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '@unifor/shared-auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">

      <!-- ══ SIDEBAR ══════════════════════════════════════════════ -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">

        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-logo">
            <i class="pi pi-graduation-cap"></i>
          </div>
          @if (!sidebarCollapsed()) {
            <div class="brand-text">
              <span class="brand-name">Unifor</span>
              <span class="brand-sub">Matriculas 2026.2</span>
            </div>
          }
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav">
          <div class="nav-section-label" [class.hidden]="sidebarCollapsed()">Navegacao</div>

          <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-item"
             [title]="sidebarCollapsed() ? 'Inicio' : ''">
            <i class="pi pi-home nav-icon"></i>
            @if (!sidebarCollapsed()) { <span>Inicio</span> }
          </a>

          @if (auth.isCoordinator()) {
            <div class="nav-section-label" [class.hidden]="sidebarCollapsed()">Coordenacao</div>
            <a routerLink="/matriz" routerLinkActive="nav-active" class="nav-item"
               [title]="sidebarCollapsed() ? 'Matriz Curricular' : ''">
              <i class="pi pi-table nav-icon"></i>
              @if (!sidebarCollapsed()) { <span>Matriz Curricular</span> }
            </a>
            <a routerLink="/matriz/criar" routerLinkActive="nav-active" class="nav-item"
               [title]="sidebarCollapsed() ? 'Nova Aula' : ''">
              <i class="pi pi-plus-circle nav-icon"></i>
              @if (!sidebarCollapsed()) { <span>Nova Aula</span> }
            </a>
          }

          @if (auth.isStudent()) {
            <div class="nav-section-label" [class.hidden]="sidebarCollapsed()">Minha Conta</div>
            <a routerLink="/matricula/disponiveis" routerLinkActive="nav-active" class="nav-item"
               [title]="sidebarCollapsed() ? 'Aulas Disponiveis' : ''">
              <i class="pi pi-calendar-plus nav-icon"></i>
              @if (!sidebarCollapsed()) { <span>Aulas Disponiveis</span> }
            </a>
            <a routerLink="/matricula/minhas" routerLinkActive="nav-active" class="nav-item"
               [title]="sidebarCollapsed() ? 'Minhas Matriculas' : ''">
              <i class="pi pi-list-check nav-icon"></i>
              @if (!sidebarCollapsed()) { <span>Minhas Matriculas</span> }
            </a>
          }
        </nav>

        <!-- User at bottom -->
        <div class="sidebar-footer">
          @if (!sidebarCollapsed()) {
            <div class="sidebar-user">
              <div class="user-av">{{ getInitials(auth.getUsername()) }}</div>
              <div class="user-info">
                <span class="user-name">{{ auth.getUsername() }}</span>
                <span class="user-role" [class.coord]="auth.isCoordinator()">
                  {{ auth.isCoordinator() ? 'Coordenador' : 'Aluno' }}
                </span>
              </div>
            </div>
          } @else {
            <div class="user-av-sm" [title]="auth.getUsername()">
              {{ getInitials(auth.getUsername()) }}
            </div>
          }
          <button class="logout-btn" (click)="auth.logout()" title="Sair">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>

      </aside>

      <!-- ══ MAIN AREA ═════════════════════════════════════════════ -->
      <div class="main-area">

        <!-- Topbar -->
        <header class="topbar">
          <button class="toggle-btn" (click)="toggleSidebar()" title="Recolher menu">
            <i class="pi pi-bars"></i>
          </button>

          <div class="topbar-title">
            @if (auth.isCoordinator()) {
              <span class="topbar-role-badge coord-badge">Coordenador</span>
            }
            @if (auth.isStudent()) {
              <span class="topbar-role-badge aluno-badge">Aluno</span>
            }
          </div>

          <div class="topbar-right">
            <div class="topbar-user">
              <div class="topbar-av">{{ getInitials(auth.getUsername()) }}</div>
              <span class="topbar-name">{{ auth.getUsername() }}</span>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="page-content">
          <router-outlet />
        </main>

      </div>
    </div>
  `,
  styles: [`
    /* ═══ Layout ═══ */
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: #f3f4f6;
    }

    /* ═══ Sidebar ═══ */
    .sidebar {
      width: 240px;
      min-height: 100vh;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.25s ease;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
      z-index: 200;
    }
    .sidebar.collapsed { width: 64px; }

    /* Brand */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #1e293b;
      min-height: 64px;
    }
    .brand-logo {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-size: 1rem; color: white;
    }
    .brand-name { display: block; font-size: 1rem; font-weight: 800; color: white; }
    .brand-sub { display: block; font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }
    .nav-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.75rem 0.5rem 0.3rem;
    }
    .nav-section-label.hidden { display: none; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .nav-item:hover { background: #1e293b; color: #e2e8f0; }
    .nav-item.nav-active { background: #1e40af; color: white; }
    .nav-item.nav-active .nav-icon { color: white; }
    .nav-icon { font-size: 1rem; flex-shrink: 0; color: #64748b; }

    /* Footer */
    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .sidebar-user {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
    }
    .user-av {
      width: 32px; height: 32px;
      background: #1e40af;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .user-av-sm {
      width: 36px; height: 36px;
      background: #1e40af;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: white;
      flex-shrink: 0;
      cursor: default;
    }
    .user-info { min-width: 0; }
    .user-name { display: block; font-size: 0.8rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { display: block; font-size: 0.68rem; color: #94a3b8; }
    .user-role.coord { color: #60a5fa; }
    .logout-btn {
      width: 32px; height: 32px; flex-shrink: 0;
      background: transparent; border: 1px solid #334155;
      border-radius: 6px; color: #64748b;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; font-size: 0.85rem;
    }
    .logout-btn:hover { background: #ef4444; border-color: #ef4444; color: white; }

    /* ═══ Main Area ═══ */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* Topbar */
    .topbar {
      height: 60px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .toggle-btn {
      width: 36px; height: 36px;
      background: transparent; border: 1px solid #e5e7eb;
      border-radius: 6px; color: #6b7280;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 1rem; transition: all 0.15s; flex-shrink: 0;
    }
    .toggle-btn:hover { background: #f3f4f6; color: #111827; }

    .topbar-title { flex: 1; }
    .topbar-role-badge {
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .coord-badge { background: #dbeafe; color: #1e40af; }
    .aluno-badge { background: #dcfce7; color: #166534; }

    .topbar-right { margin-left: auto; }
    .topbar-user {
      display: flex; align-items: center; gap: 0.6rem;
    }
    .topbar-av {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: white;
    }
    .topbar-name { font-size: 0.875rem; font-weight: 600; color: #374151; }

    /* Page content */
    .page-content {
      flex: 1;
      padding: 1.75rem;
      overflow-y: auto;
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  title = 'enrollment-app';
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
