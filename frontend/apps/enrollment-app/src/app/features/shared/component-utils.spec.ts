/**
 * Utilitarios dos Componentes — Testes Unitarios (funcoes puras)
 *
 * Testa as funcoes de transformacao/calculo usadas nos componentes.
 * Sao funcoes puras — sem dependencias externas, sem TestBed.
 *
 * Cobre:
 * - getDiaSemanaLabel: mapeamento de todos os dias da semana + fallback
 * - getPeriodoLabel: mapeamento MANHA/TARDE/NOITE + fallback
 * - getPeriodoSeverity: mapeamento para severidades do PrimeNG + fallback
 * - getVagasPercent: calculo de percentual de vagas ocupadas + divisao por zero
 * - getInitials: iniciais do nome, limite 2, maiusculas, fallback 'U'
 * - getFirstName: primeiro nome do usuario para o dashboard
 */

// ── getDiaSemanaLabel ─────────────────────────────────────────────────────────

const getDiaSemanaLabel = (dia: string): string => {
  const map: Record<string, string> = {
    SEG: 'Segunda', TER: 'Terca', QUA: 'Quarta',
    QUI: 'Quinta', SEX: 'Sexta', SAB: 'Sabado', DOM: 'Domingo',
  };
  return map[dia] ?? dia;
};

describe('getDiaSemanaLabel', () => {
  it.each([
    ['SEG', 'Segunda'],
    ['TER', 'Terca'],
    ['QUA', 'Quarta'],
    ['QUI', 'Quinta'],
    ['SEX', 'Sexta'],
    ['SAB', 'Sabado'],
    ['DOM', 'Domingo'],
  ])('mapeia %s para %s', (input, expected) => {
    expect(getDiaSemanaLabel(input)).toBe(expected);
  });

  it('retorna o proprio valor para codigo desconhecido', () => {
    expect(getDiaSemanaLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('retorna string vazia para input vazio', () => {
    expect(getDiaSemanaLabel('')).toBe('');
  });
});

// ── getPeriodoLabel ───────────────────────────────────────────────────────────

const getPeriodoLabel = (periodo: string): string =>
  ({ MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' }[periodo] ?? periodo);

describe('getPeriodoLabel', () => {
  it.each([
    ['MANHA', 'Manha'],
    ['TARDE', 'Tarde'],
    ['NOITE', 'Noite'],
  ])('mapeia %s para %s', (input, expected) => {
    expect(getPeriodoLabel(input)).toBe(expected);
  });

  it('retorna o proprio valor para periodo desconhecido', () => {
    expect(getPeriodoLabel('VESPERTINO')).toBe('VESPERTINO');
  });
});

// ── getPeriodoSeverity ────────────────────────────────────────────────────────

const getPeriodoSeverity = (periodo: string): string =>
  ({ MANHA: 'success', TARDE: 'info', NOITE: 'warn' }[periodo] ?? 'info');

describe('getPeriodoSeverity', () => {
  it('retorna "success" para MANHA', () => {
    expect(getPeriodoSeverity('MANHA')).toBe('success');
  });

  it('retorna "info" para TARDE', () => {
    expect(getPeriodoSeverity('TARDE')).toBe('info');
  });

  it('retorna "warn" para NOITE', () => {
    expect(getPeriodoSeverity('NOITE')).toBe('warn');
  });

  it('retorna "info" como fallback para periodo desconhecido', () => {
    expect(getPeriodoSeverity('UNKNOWN')).toBe('info');
  });
});

// ── getVagasPercent ───────────────────────────────────────────────────────────

const getVagasPercent = (aula: {
  vagasDisponiveis: number;
  maxAlunos: number;
}): number => {
  if (aula.maxAlunos === 0) return 0;
  return Math.round(
    ((aula.maxAlunos - aula.vagasDisponiveis) / aula.maxAlunos) * 100
  );
};

describe('getVagasPercent', () => {
  it('retorna 0% quando nenhuma vaga foi ocupada (turma vazia)', () => {
    expect(getVagasPercent({ vagasDisponiveis: 30, maxAlunos: 30 })).toBe(0);
  });

  it('retorna 100% quando todas as vagas foram ocupadas', () => {
    expect(getVagasPercent({ vagasDisponiveis: 0, maxAlunos: 30 })).toBe(100);
  });

  it('retorna 50% quando metade das vagas foi ocupada', () => {
    expect(getVagasPercent({ vagasDisponiveis: 20, maxAlunos: 40 })).toBe(50);
  });

  it('retorna 75% quando 3/4 das vagas foi ocupada', () => {
    expect(getVagasPercent({ vagasDisponiveis: 10, maxAlunos: 40 })).toBe(75);
  });

  it('arredonda corretamente para valores fracionados', () => {
    expect(getVagasPercent({ vagasDisponiveis: 1, maxAlunos: 3 })).toBe(67);
  });

  it('retorna 0 quando maxAlunos for 0 — evita divisao por zero', () => {
    expect(getVagasPercent({ vagasDisponiveis: 0, maxAlunos: 0 })).toBe(0);
  });
});

// ── getInitials ───────────────────────────────────────────────────────────────

const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

describe('getInitials', () => {
  it('retorna iniciais de nome composto', () => {
    expect(getInitials('Joao Silva')).toBe('JS');
    expect(getInitials('Ana Coordenadora')).toBe('AC');
  });

  it('retorna apenas a primeira inicial para nome simples', () => {
    expect(getInitials('Joao')).toBe('J');
  });

  it('limita a 2 iniciais mesmo para nomes com mais palavras', () => {
    expect(getInitials('Joao da Silva Santos')).toBe('JD');
  });

  it('retorna "U" para string vazia', () => {
    expect(getInitials('')).toBe('U');
  });

  it('converte para maiusculas', () => {
    expect(getInitials('joao silva')).toBe('JS');
  });
});

// ── getFirstName ──────────────────────────────────────────────────────────────

const getFirstName = (name: string): string =>
  name ? name.split(' ')[0] : '';

describe('getFirstName', () => {
  it('retorna apenas o primeiro nome de nome composto', () => {
    expect(getFirstName('Joao Aluno')).toBe('Joao');
    expect(getFirstName('Ana Coordenadora')).toBe('Ana');
  });

  it('retorna o proprio valor para nome simples', () => {
    expect(getFirstName('Joao')).toBe('Joao');
  });

  it('retorna string vazia para input vazio', () => {
    expect(getFirstName('')).toBe('');
  });
});
