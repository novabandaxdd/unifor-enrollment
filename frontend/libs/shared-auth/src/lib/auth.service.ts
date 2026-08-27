import { Injectable, inject } from '@angular/core';
import { Keycloak } from 'keycloak-angular';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(Keycloak);

  getToken(): Observable<string> {
    return from(this.keycloak.getToken());
  }

  getUserRoles(): string[] {
    return this.keycloak.getRealmRoles() ?? [];
  }

  isCoordinator(): boolean {
    return this.keycloak.hasRealmRole('COORDENADOR');
  }

  isStudent(): boolean {
    return this.keycloak.hasRealmRole('ALUNO');
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
