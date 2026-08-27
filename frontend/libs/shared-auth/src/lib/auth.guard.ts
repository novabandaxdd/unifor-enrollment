import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (_route, state) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const authenticated = keycloak.isLoggedIn();
  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + state.url });
    return false;
  }
  return true;
};

export const roleGuard = (role: 'COORDENADOR' | 'ALUNO'): CanActivateFn => {
  return (_route, _state) => {
    const keycloak = inject(KeycloakService);
    const router = inject(Router);

    // getUserRoles(true) = include realm roles
    const roles = keycloak.getUserRoles(true) ?? [];
    const hasRole = roles.includes(role);

    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  };
};
