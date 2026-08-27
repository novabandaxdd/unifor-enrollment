import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);

  getToken(): Observable<string> {
    return from(this.keycloak.getToken());
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles() ?? [];
  }

  isCoordinator(): boolean {
    return this.keycloak.isUserInRole('COORDENADOR');
  }

  isStudent(): boolean {
    return this.keycloak.isUserInRole('ALUNO');
  }

  getUsername(): string {
    const profile = this.keycloak.getKeycloakInstance()?.tokenParsed;
    return (profile?.['preferred_username'] as string) ?? '';
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }
}
