import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);

  getToken(): Observable<string> {
    return from(this.keycloak.getToken());
  }

  /**
   * Returns realm-level roles from the Keycloak token.
   * keycloak-angular v20: getUserRoles(true) returns realm roles (allRoles=true).
   */
  getUserRoles(): string[] {
    // true = include realm roles (not just client roles)
    return this.keycloak.getUserRoles(true) ?? [];
  }

  isCoordinator(): boolean {
    return this.getUserRoles().includes('COORDENADOR');
  }

  isStudent(): boolean {
    return this.getUserRoles().includes('ALUNO');
  }

  getUsername(): string {
    const tokenParsed = this.keycloak.getKeycloakInstance()?.tokenParsed;
    // Return firstName if available, otherwise preferred_username (email)
    return (
      (tokenParsed?.['given_name'] as string) ||
      (tokenParsed?.['preferred_username'] as string) ||
      ''
    );
  }

  getKeycloakId(): string {
    return this.keycloak.getKeycloakInstance()?.subject ?? '';
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }
}
