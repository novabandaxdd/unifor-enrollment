/**
 * Auth Guards — Testes Unitarios
 *
 * Cobre:
 * - authGuard: permite acesso quando autenticado
 * - authGuard: chama keycloak.login e retorna false quando nao autenticado
 * - roleGuard: permite acesso com role correto (COORDENADOR e ALUNO)
 * - roleGuard: bloqueia e redireciona para /unauthorized com role incorreto
 * - roleGuard: bloqueia quando sem nenhum role
 */
import { Injector, runInInjectionContext } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import Keycloak from 'keycloak-js';
import { authGuard, roleGuard } from '@unifor/shared-auth';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = { url: '/dashboard' } as RouterStateSnapshot;

function mkKeycloak(authenticated: boolean, roles: string[] = []): Partial<Keycloak> {
  return {
    authenticated,
    realmAccess: { roles },
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
  };
}

function setup(authenticated: boolean, roles: string[] = []) {
  const keycloak = mkKeycloak(authenticated, roles);
  const navigateSpy = jest.fn().mockResolvedValue(true);
  const mockRouter = { navigate: navigateSpy } as unknown as Router;

  const injector = Injector.create({
    providers: [
      { provide: Keycloak, useValue: keycloak },
      { provide: Router, useValue: mockRouter },
    ],
  });

  return { keycloak, navigateSpy, injector };
}

// ── authGuard ─────────────────────────────────────────────────────────────────

describe('authGuard', () => {
  it('retorna true quando o usuario esta autenticado', async () => {
    const { injector } = setup(true);

    const result = await runInInjectionContext(injector, () =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });

  it('chama keycloak.login e retorna false quando nao autenticado', async () => {
    const { keycloak, injector } = setup(false);

    const result = await runInInjectionContext(injector, () =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(keycloak.login).toHaveBeenCalledWith(
      expect.objectContaining({ redirectUri: expect.stringContaining('/dashboard') })
    );
  });
});

// ── roleGuard ─────────────────────────────────────────────────────────────────

describe('roleGuard', () => {
  it('retorna true para usuario com role COORDENADOR', () => {
    const { injector } = setup(true, ['COORDENADOR']);

    const result = runInInjectionContext(injector, () =>
      roleGuard('COORDENADOR')(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });

  it('retorna true para usuario com role ALUNO', () => {
    const { injector } = setup(true, ['ALUNO']);

    const result = runInInjectionContext(injector, () =>
      roleGuard('ALUNO')(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });

  it('retorna false e redireciona para /unauthorized quando role incorreto', () => {
    const { navigateSpy, injector } = setup(true, ['ALUNO']);

    const result = runInInjectionContext(injector, () =>
      roleGuard('COORDENADOR')(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('retorna false quando usuario nao tem nenhum role', () => {
    const { navigateSpy, injector } = setup(true, []);

    const result = runInInjectionContext(injector, () =>
      roleGuard('ALUNO')(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/unauthorized']);
  });
});
