import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Keycloak } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  const authenticated = keycloak.authenticated;
  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return false;
  }
  return true;
};

export const roleGuard = (role: 'COORDENADOR' | 'ALUNO'): CanActivateFn => {
  return (_route, _state) => {
    const keycloak = inject(Keycloak);
    const router = inject(Router);

    const hasRole = keycloak.hasRealmRole(role);
    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  };
};
