import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

/**
 * Guard that verifies the user is authenticated via Keycloak.
 * Uses the new keycloak-angular v20 API: inject(Keycloak) directly
 * (KeycloakService is deprecated and NOT provided by provideKeycloak).
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url,
    });
    return false;
  }
  return true;
};

/**
 * Guard that checks the user has a required realm role.
 * Realm roles are found in keycloak.realmAccess?.roles.
 */
export const roleGuard = (role: 'COORDENADOR' | 'ALUNO'): CanActivateFn => {
  return (_route, _state) => {
    const keycloak = inject(Keycloak);
    const router = inject(Router);

    const roles = keycloak.realmAccess?.roles ?? [];
    if (!roles.includes(role)) {
      router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  };
};
