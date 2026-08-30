import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { from, Observable } from 'rxjs';

/**
 * AuthService using the new keycloak-angular v20 API.
 * Injects the raw Keycloak instance provided by provideKeycloak().
 * KeycloakService (legacy) is NOT provided by provideKeycloak — avoid it.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(Keycloak);

  getToken(): Observable<string> {
    return from(
      this.keycloak
        .updateToken(30)
        .then(() => this.keycloak.token ?? '')
        .catch(() => this.keycloak.token ?? '')
    );
  }

  /**
   * Returns realm-level roles from the Keycloak token.
   * keycloak-js: keycloak.realmAccess.roles contains realm roles.
   */
  getUserRoles(): string[] {
    return this.keycloak.realmAccess?.roles ?? [];
  }

  isCoordinator(): boolean {
    return this.getUserRoles().includes('COORDENADOR');
  }

  isStudent(): boolean {
    return this.getUserRoles().includes('ALUNO');
  }

  getUsername(): string {
    const parsed = this.keycloak.tokenParsed;
    return (
      (parsed?.['given_name'] as string) ||
      (parsed?.['preferred_username'] as string) ||
      ''
    );
  }

  getKeycloakId(): string {
    return this.keycloak.subject ?? '';
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
