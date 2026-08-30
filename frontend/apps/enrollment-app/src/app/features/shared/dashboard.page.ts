import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@unifor/shared-auth';
import { MatrizStore, MatriculaStore } from '@unifor/shared-data-access';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">

      <!-- ══ COORDENADOR ════════════════════════════════════════════ -->
      @if (auth.isCoordinator()) {

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Visao Geral</h1>
            <p class="page-sub">Semestre 2025.1 — Bem-vindo, {{ auth.getUsername() }}</p>
          </div>
          <a routerLink="/matriz/criar" class="btn-primary">
            <i class="pi pi-plus"></i> Nova Aula
          </a>
        </div>

        <!-- Stats cards -->
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon"><i class="pi pi-table"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ matriz.aulas().length }}</span>
              <span class="stat-label">Aulas na Matriz</span>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon"><i class="pi pi-users"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ getTotalVagasOcupadas() }}</span>
              <span class="stat-label">Vagas Ocupadas</span>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><i class="pi pi-chart-bar"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ getTotalVagasDisponiveis() }}</span>
              <span class="stat-label">Vagas Disponiveis</span>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon"><i class="pi pi-exclamation-circle"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ getAulasEsgotadas() }}</span>
              <span class="stat-label">Aulas Esgotadas</span>
            </div>
          </div>
        </div>

        <div class="content-grid">

          <!-- Aulas recentes -->
          <div class="panel">
            <div class="panel-header">
              <h3><i class="pi pi-list"></i> Aulas Cadastradas</h3>
              <a routerLink="/matriz" class="panel-link">Ver todas</a>
            </div>
            <div class="panel-body">
              @if (matriz.loading()) {
                <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Carregando...</div>
              } @else if (matriz.aulas().length === 0) {
                <div class="empty-inline">
                  <i class="pi pi-inbox"></i>
                  <p>Nenhuma aula cadastrada ainda.</p>
                  <a routerLink="/matriz/criar">Criar primeira aula</a>
                </div>
              } @else {
                @for (aula of matriz.aulas().slice(0, 5); track aula.id) {
                  <div class="aula-row">
                    <div class="aula-row-left">
                      <div class="aula-disciplina">{{ aula.disciplina.nome }}</div>
                      <div class="aula-meta">
                        {{ aula.professor.nome }} &middot;
                        {{ getDiaLabel(aula.horario.diaSemana) }}
                        {{ aula.horario.horaInicio.substring(0,5) }}-{{ aula.horario.horaFim.substring(0,5) }}
                      </div>
                    </div>
                    <div class="vagas-badge" [class.esgotado]="aula.vagasDisponiveis === 0">
                      {{ aula.vagasDisponiveis }}/{{ aula.maxAlunos }}
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Quick actions + Periodo summary -->
          <div class="side-panels">
            <div class="panel">
              <div class="panel-header">
                <h3><i class="pi pi-bolt"></i> Acoes Rapidas</h3>
              </div>
              <div class="panel-body">
                <a routerLink="/matriz/criar" class="quick-action blue">
                  <i class="pi pi-plus-circle"></i>
                  <div>
                    <strong>Criar Aula</strong>
                    <span>Adicionar nova aula a matriz</span>
                  </div>
                </a>
                <a routerLink="/matriz" class="quick-action purple">
                  <i class="pi pi-pencil"></i>
                  <div>
                    <strong>Gerenciar Matriz</strong>
                    <span>Editar, filtrar e excluir aulas</span>
                  </div>
                </a>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <h3><i class="pi pi-calendar"></i> Distribuicao por Periodo</h3>
              </div>
              <div class="panel-body">
                @for (p of getPeriodosResumo(); track p.label) {
                  <div class="periodo-row">
                    <div class="periodo-dot" [class]="p.cls"></div>
                    <span class="periodo-label">{{ p.label }}</span>
                    <div class="periodo-bar-wrap">
                      <div class="periodo-bar" [class]="p.cls" [style.width.%]="p.pct"></div>
                    </div>
                    <span class="periodo-count">{{ p.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>

      }

      <!-- ══ ALUNO ═══════════════════════════════════════════════════ -->
      @if (auth.isStudent()) {

        <!-- Header com info do curso -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Ola, {{ getFirstName(auth.getUsername()) }}!</h1>
            <p class="page-sub">Semestre 2025.1 — Gerencie suas matriculas</p>
          </div>
        </div>

        <!-- Card perfil do aluno -->
        <div class="aluno-profile-card">
          <div class="profile-avatar">{{ getInitials(auth.getUsername()) }}</div>
          <div class="profile-info">
            <h2 class="profile-name">{{ auth.getUsername() }}</h2>
            <div class="profile-badges">
              <span class="badge-aluno"><i class="pi pi-graduation-cap"></i> Aluno</span>
              <span class="badge-semestre"><i class="pi pi-calendar"></i> 2025.1</span>
            </div>
          </div>
          <div class="profile-stats">
            <div class="pstat">
              <span class="pstat-val">{{ matricula.minhasMatriculas().length }}</span>
              <span class="pstat-lbl">Matriculas Ativas</span>
            </div>
            <div class="pstat-divider"></div>
            <div class="pstat">
              <span class="pstat-val">{{ matricula.aulasDisponiveis().length }}</span>
              <span class="pstat-lbl">Aulas Disponiveis</span>
            </div>
          </div>
        </div>

        <!-- Stats aluno -->
        <div class="stats-grid four">
          <div class="stat-card blue">
            <div class="stat-icon"><i class="pi pi-list-check"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ matricula.minhasMatriculas().length }}</span>
              <span class="stat-label">Matriculas Ativas</span>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon"><i class="pi pi-calendar-plus"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ matricula.aulasDisponiveis().length }}</span>
              <span class="stat-label">Aulas Disponiveis</span>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><i class="pi pi-clock"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ getTotalHoras() }}h</span>
              <span class="stat-label">Carga Horaria</span>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon"><i class="pi pi-sun"></i></div>
            <div class="stat-body">
              <span class="stat-value">{{ getPeriodoAluno() }}</span>
              <span class="stat-label">Periodo Preferido</span>
            </div>
          </div>
        </div>

        <div class="content-grid">

          <!-- Minhas matriculas preview -->
          <div class="panel">
            <div class="panel-header">
              <h3><i class="pi pi-bookmark-fill"></i> Minhas Matriculas</h3>
              <a routerLink="/matricula/minhas" class="panel-link">Ver todas</a>
            </div>
            <div class="panel-body">
              @if (matricula.loading()) {
                <div class="loading-row"><i class="pi pi-spin pi-spinner"></i> Carregando...</div>
              } @else if (matricula.minhasMatriculas().length === 0) {
                <div class="empty-inline">
                  <i class="pi pi-bookmark"></i>
                  <p>Voce ainda nao tem matriculas.</p>
                  <a routerLink="/matricula/disponiveis">Explorar aulas disponiveis</a>
                </div>
              } @else {
                @for (m of matricula.minhasMatriculas(); track m.id) {
                  <div class="aula-row">
                    <div class="periodo-dot" [class]="getPeriodoCls(m.aulaMatriz.horario.periodo)"></div>
                    <div class="aula-row-left">
                      <div class="aula-disciplina">{{ m.aulaMatriz.disciplina.nome }}</div>
                      <div class="aula-meta">
                        {{ m.aulaMatriz.professor.nome }} &middot;
                        {{ getDiaLabel(m.aulaMatriz.horario.diaSemana) }}
                        {{ m.aulaMatriz.horario.horaInicio.substring(0,5) }}
                      </div>
                    </div>
                    <span class="periodo-chip" [class]="getPeriodoCls(m.aulaMatriz.horario.periodo)">
                      {{ getPeriodoLabel(m.aulaMatriz.horario.periodo) }}
                    </span>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Side: disponiveis + dica -->
          <div class="side-panels">

            <div class="panel">
              <div class="panel-header">
                <h3><i class="pi pi-calendar-plus"></i> Proximas Disponiveis</h3>
                <a routerLink="/matricula/disponiveis" class="panel-link">Ver todas</a>
              </div>
              <div class="panel-body">
                @if (matricula.aulasDisponiveis().length === 0) {
                  <div class="empty-inline">
                    <i class="pi pi-check-circle" style="color:#22c55e"></i>
                    <p>Voce esta matriculado em todas as aulas disponiveis!</p>
                  </div>
                } @else {
                  @for (a of matricula.aulasDisponiveis().slice(0, 4); track a.id) {
                    <div class="aula-row compact">
                      <div class="aula-row-left">
                        <div class="aula-disciplina">{{ a.disciplina.nome }}</div>
                        <div class="aula-meta">
                          {{ getDiaLabel(a.horario.diaSemana) }}
                          {{ a.horario.horaInicio.substring(0,5) }}
                        </div>
                      </div>
                      <span class="vagas-badge" [class.esgotado]="a.vagasDisponiveis === 0">
                        {{ a.vagasDisponiveis }} vagas
                      </span>
                    </div>
                  }
                }
              </div>
            </div>

            <div class="panel panel-tip">
              <div class="tip-icon"><i class="pi pi-lightbulb"></i></div>
              <div>
                <strong>Como funciona a matricula?</strong>
                <p>Acesse "Aulas Disponiveis", escolha uma aula do seu curso e confirme a matricula. O sistema valida automaticamente conflitos de horario e disponibilidade de vagas.</p>
              </div>
            </div>

          </div>

        </div>

      }

    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
    }
    .page-title { font-size: 1.75rem; font-weight: 800; color: #111827; margin: 0; }
    .page-sub { font-size: 0.9rem; color: #6b7280; margin: 0.2rem 0 0; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      background: #2563eb; color: white; text-decoration: none;
      padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: #1d4ed8; }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .stat-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      border: 1px solid #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
    }
    .stat-card.blue .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-card.green .stat-icon { background: #dcfce7; color: #16a34a; }
    .stat-card.purple .stat-icon { background: #ede9fe; color: #7c3aed; }
    .stat-card.orange .stat-icon { background: #ffedd5; color: #ea580c; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: #111827; line-height: 1; }
    .stat-label { font-size: 0.78rem; color: #6b7280; margin-top: 0.25rem; }

    /* Content grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1rem;
      align-items: start;
    }

    /* Panel */
    .panel {
      background: white; border-radius: 12px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem; border-bottom: 1px solid #f3f4f6;
    }
    .panel-header h3 {
      font-size: 0.9rem; font-weight: 700; color: #111827; margin: 0;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .panel-header h3 .pi { color: #6b7280; font-size: 0.875rem; }
    .panel-link { font-size: 0.8rem; color: #2563eb; text-decoration: none; font-weight: 500; }
    .panel-link:hover { text-decoration: underline; }
    .panel-body { padding: 0.75rem; display: flex; flex-direction: column; gap: 0; }

    .side-panels { display: flex; flex-direction: column; gap: 1rem; }

    /* Aula row */
    .aula-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.65rem 0.5rem; border-bottom: 1px solid #f9fafb;
      transition: background 0.1s;
    }
    .aula-row:last-child { border-bottom: none; }
    .aula-row:hover { background: #f9fafb; border-radius: 6px; }
    .aula-row.compact { padding: 0.5rem; }
    .aula-row-left { flex: 1; min-width: 0; }
    .aula-disciplina { font-size: 0.875rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .aula-meta { font-size: 0.775rem; color: #9ca3af; margin-top: 1px; }

    /* Vagas badge */
    .vagas-badge {
      font-size: 0.75rem; font-weight: 600;
      background: #dcfce7; color: #16a34a;
      padding: 0.15rem 0.55rem; border-radius: 99px;
      white-space: nowrap; flex-shrink: 0;
    }
    .vagas-badge.esgotado { background: #fee2e2; color: #dc2626; }

    /* Periodo */
    .periodo-row {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.5rem 0;
    }
    .periodo-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .periodo-dot.manha, .manha { background: #fbbf24; }
    .periodo-dot.tarde, .tarde { background: #60a5fa; }
    .periodo-dot.noite, .noite { background: #818cf8; }
    .periodo-label { font-size: 0.8rem; color: #374151; min-width: 50px; }
    .periodo-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
    .periodo-bar { height: 100%; border-radius: 99px; transition: width 0.5s; }
    .periodo-bar.manha { background: #fbbf24; }
    .periodo-bar.tarde { background: #60a5fa; }
    .periodo-bar.noite { background: #818cf8; }
    .periodo-count { font-size: 0.8rem; font-weight: 700; color: #374151; min-width: 18px; text-align: right; }

    /* Periodo chip */
    .periodo-chip {
      font-size: 0.7rem; font-weight: 600;
      padding: 0.15rem 0.55rem; border-radius: 4px; flex-shrink: 0;
    }
    .periodo-chip.manha { background: #fef9c3; color: #92400e; }
    .periodo-chip.tarde { background: #dbeafe; color: #1e40af; }
    .periodo-chip.noite { background: #ede9fe; color: #5b21b6; }

    /* Quick actions */
    .quick-action {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 8px; text-decoration: none;
      margin-bottom: 0.5rem; transition: background 0.15s;
    }
    .quick-action:last-child { margin-bottom: 0; }
    .quick-action.blue { background: #eff6ff; color: #1e40af; }
    .quick-action.blue:hover { background: #dbeafe; }
    .quick-action.purple { background: #f5f3ff; color: #5b21b6; }
    .quick-action.purple:hover { background: #ede9fe; }
    .quick-action .pi { font-size: 1.2rem; flex-shrink: 0; }
    .quick-action strong { display: block; font-size: 0.85rem; font-weight: 700; }
    .quick-action span { display: block; font-size: 0.775rem; opacity: 0.75; }

    /* Empty / Loading */
    .empty-inline {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.4rem; padding: 1.5rem 0; text-align: center; color: #9ca3af;
    }
    .empty-inline .pi { font-size: 1.75rem; }
    .empty-inline p { font-size: 0.85rem; margin: 0; }
    .empty-inline a { font-size: 0.82rem; color: #2563eb; text-decoration: none; }
    .empty-inline a:hover { text-decoration: underline; }
    .loading-row { padding: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

    /* Aluno profile card */
    .aluno-profile-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      border-radius: 16px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1.25rem;
      color: white;
    }
    .profile-avatar {
      width: 60px; height: 60px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 700;
      flex-shrink: 0;
    }
    .profile-info { flex: 1; }
    .profile-name { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.4rem; }
    .profile-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge-aluno, .badge-semestre {
      font-size: 0.72rem; font-weight: 600;
      padding: 0.15rem 0.6rem; border-radius: 99px;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .badge-aluno { background: rgba(34,197,94,0.2); color: #86efac; }
    .badge-semestre { background: rgba(96,165,250,0.2); color: #93c5fd; }
    .profile-stats { display: flex; align-items: center; gap: 1.5rem; }
    .pstat { text-align: center; }
    .pstat-val { display: block; font-size: 1.5rem; font-weight: 800; }
    .pstat-lbl { display: block; font-size: 0.7rem; opacity: 0.65; white-space: nowrap; }
    .pstat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

    /* Tip panel */
    .panel-tip {
      display: flex !important; flex-direction: row !important;
      gap: 0.75rem; padding: 1rem 1.25rem;
      background: #fffbeb; border-color: #fde68a;
    }
    .panel-tip .panel-body { display: none; }
    .tip-icon { font-size: 1.25rem; color: #f59e0b; flex-shrink: 0; padding-top: 0.1rem; }
    .panel-tip strong { font-size: 0.85rem; color: #92400e; }
    .panel-tip p { font-size: 0.8rem; color: #92400e; opacity: 0.8; margin: 0.25rem 0 0; line-height: 1.5; }
  `],
})
export class DashboardPage implements OnInit {
  auth = inject(AuthService);
  matriz = inject(MatrizStore);
  matricula = inject(MatriculaStore);

  ngOnInit(): void {
    if (this.auth.isCoordinator()) {
      this.matriz.loadAulas();
    }
    if (this.auth.isStudent()) {
      this.matricula.loadMinhasMatriculas();
      this.matricula.loadAulasDisponiveis();
    }
  }

  // ── Coordenador helpers ──────────────────────────────────────────
  getTotalVagasOcupadas(): number {
    return this.matriz.aulas().reduce((acc, a) => acc + (a.maxAlunos - Number(a.vagasDisponiveis)), 0);
  }
  getTotalVagasDisponiveis(): number {
    return this.matriz.aulas().reduce((acc, a) => acc + Number(a.vagasDisponiveis), 0);
  }
  getAulasEsgotadas(): number {
    return this.matriz.aulas().filter(a => a.vagasDisponiveis === 0).length;
  }
  getPeriodosResumo(): { label: string; count: number; pct: number; cls: string }[] {
    const total = this.matriz.aulas().length || 1;
    const counts: Record<string, number> = { MANHA: 0, TARDE: 0, NOITE: 0 };
    this.matriz.aulas().forEach(a => { counts[a.horario.periodo] = (counts[a.horario.periodo] || 0) + 1; });
    return [
      { label: 'Manha', count: counts['MANHA'], pct: Math.round(counts['MANHA'] / total * 100), cls: 'manha' },
      { label: 'Tarde', count: counts['TARDE'], pct: Math.round(counts['TARDE'] / total * 100), cls: 'tarde' },
      { label: 'Noite', count: counts['NOITE'], pct: Math.round(counts['NOITE'] / total * 100), cls: 'noite' },
    ];
  }

  // ── Aluno helpers ────────────────────────────────────────────────
  getTotalHoras(): number {
    return this.matricula.minhasMatriculas().reduce((acc, m) => acc + m.aulaMatriz.disciplina.cargaHoraria, 0);
  }
  getPeriodoAluno(): string {
    const counts: Record<string, number> = {};
    this.matricula.minhasMatriculas().forEach(m => {
      const p = m.aulaMatriz.horario.periodo;
      counts[p] = (counts[p] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top) return '-';
    return { MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' }[top[0]] ?? top[0];
  }
  getPeriodoCls(p: string): string {
    return { MANHA: 'manha', TARDE: 'tarde', NOITE: 'noite' }[p] ?? '';
  }
  getPeriodoLabel(p: string): string {
    return { MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' }[p] ?? p;
  }

  // ── Generic helpers ──────────────────────────────────────────────
  getFirstName(name: string): string {
    return name.split(' ')[0] || name;
  }
  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
  getDiaLabel(dia: string): string {
    const map: Record<string, string> = { SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui', SEX: 'Sex', SAB: 'Sab' };
    return map[dia] ?? dia;
  }
}
