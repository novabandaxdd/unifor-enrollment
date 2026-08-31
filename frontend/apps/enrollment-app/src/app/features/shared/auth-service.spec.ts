/**
 * AuthService — Testes Unitarios
 *
 * Cobre:
 * - getUserRoles: retorna roles do token, vazio quando undefined
 * - isCoordinator: true/false conforme role COORDENADOR
 * - isStudent: true/false conforme role ALUNO
 * - getUsername: prefere given_name, fallback preferred_username, vazio
 * - getKeycloakId: retorna subject, vazio quando undefined
 * - isAuthenticated: true/false/undefined
 * - getToken: retorna token atual, fallback em rejeicao do updateToken
 */
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { AuthService } from '@unifor/shared-auth';

// ── Setup ─────────────────────────────────────────────────────────────────────

function mkKeycloak(overrides: Partial<Keycloak> = {}): Partial<Keycloak> {
  return {
    authenticated: true,
    token: 'mock-token',
    subject: 'user-uuid-123',
    realmAccess: { roles: [] },
    tokenParsed: {
      sub: 'user-uuid-123',
      preferred_username: 'joao.aluno',
      given_name: 'Joao',
    },
    updateToken: jest.fn().mockResolvedValue(true),
    logout: jest.fn(),
    login: jest.fn(),
    ...overrides,
  };
}

function setup(overrides: Partial<Keycloak> = {}) {
  const keycloak = mkKeycloak(overrides);
  TestBed.configureTestingModule({
    providers: [
      AuthService,
      { provide: Keycloak, useValue: keycloak },
    ],
  });
  return { service: TestBed.inject(AuthService), keycloak };
}

afterEach(() => TestBed.resetTestingModule());

// ── Testes ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {

  // ── getUserRoles ──────────────────────────────────────────────────────────

  describe('getUserRoles', () => {
    it('retorna lista de roles do realmAccess', () => {
      const { service } = setup({
        realmAccess: { roles: ['ALUNO', 'offline_access'] },
      });
      expect(service.getUserRoles()).toEqual(['ALUNO', 'offline_access']);
    });

    it('retorna array vazio quando realmAccess for undefined', () => {
      const { service } = setup({ realmAccess: undefined });
      expect(service.getUserRoles()).toEqual([]);
    });
  });

  // ── isCoordinator ─────────────────────────────────────────────────────────

  describe('isCoordinator', () => {
    it('retorna true quando tem role COORDENADOR', () => {
      const { service } = setup({ realmAccess: { roles: ['COORDENADOR'] } });
      expect(service.isCoordinator()).toBe(true);
    });

    it('retorna false quando tem apenas role ALUNO', () => {
      const { service } = setup({ realmAccess: { roles: ['ALUNO'] } });
      expect(service.isCoordinator()).toBe(false);
    });

    it('retorna false quando realmAccess for undefined', () => {
      const { service } = setup({ realmAccess: undefined });
      expect(service.isCoordinator()).toBe(false);
    });
  });

  // ── isStudent ─────────────────────────────────────────────────────────────

  describe('isStudent', () => {
    it('retorna true quando tem role ALUNO', () => {
      const { service } = setup({ realmAccess: { roles: ['ALUNO'] } });
      expect(service.isStudent()).toBe(true);
    });

    it('retorna false quando tem apenas role COORDENADOR', () => {
      const { service } = setup({ realmAccess: { roles: ['COORDENADOR'] } });
      expect(service.isStudent()).toBe(false);
    });
  });

  // ── getUsername ───────────────────────────────────────────────────────────

  describe('getUsername', () => {
    it('prefere given_name quando disponivel', () => {
      const { service } = setup({
        tokenParsed: { given_name: 'Joao', preferred_username: 'joao.aluno' },
      });
      expect(service.getUsername()).toBe('Joao');
    });

    it('usa preferred_username quando given_name for string vazia', () => {
      const { service } = setup({
        tokenParsed: { given_name: '', preferred_username: 'joao.aluno' },
      });
      expect(service.getUsername()).toBe('joao.aluno');
    });

    it('retorna string vazia quando tokenParsed for undefined', () => {
      const { service } = setup({ tokenParsed: undefined });
      expect(service.getUsername()).toBe('');
    });
  });

  // ── getKeycloakId ─────────────────────────────────────────────────────────

  describe('getKeycloakId', () => {
    it('retorna o subject do token', () => {
      const { service } = setup({ subject: 'meu-uuid' });
      expect(service.getKeycloakId()).toBe('meu-uuid');
    });

    it('retorna string vazia quando subject for undefined', () => {
      const { service } = setup({ subject: undefined });
      expect(service.getKeycloakId()).toBe('');
    });
  });

  // ── isAuthenticated ───────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('retorna true quando autenticado', () => {
      const { service } = setup({ authenticated: true });
      expect(service.isAuthenticated()).toBe(true);
    });

    it('retorna false quando nao autenticado', () => {
      const { service } = setup({ authenticated: false });
      expect(service.isAuthenticated()).toBe(false);
    });

    it('retorna false quando authenticated for undefined', () => {
      const { service } = setup({ authenticated: undefined });
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // ── getToken ──────────────────────────────────────────────────────────────

  describe('getToken', () => {
    it('retorna o token apos updateToken bem-sucedido', (done) => {
      const { service, keycloak } = setup({ token: 'bearer-xyz' });

      service.getToken().subscribe((token) => {
        expect(token).toBe('bearer-xyz');
        expect(keycloak.updateToken).toHaveBeenCalledWith(30);
        done();
      });
    });

    it('usa token como fallback quando updateToken rejeitar', (done) => {
      const { service } = setup({
        token: 'fallback-token',
        updateToken: jest.fn().mockRejectedValue(new Error('expired')),
      });

      service.getToken().subscribe((token) => {
        expect(token).toBe('fallback-token');
        done();
      });
    });
  });
});
