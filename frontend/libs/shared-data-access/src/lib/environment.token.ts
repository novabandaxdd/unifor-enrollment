import { InjectionToken } from '@angular/core';

export interface Environment {
  apiUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
}

/**
 * InjectionToken for environment config.
 * Must be provided in the root AppConfig via { provide: ENVIRONMENT, useValue: environment }.
 */
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'http://localhost:8080',
    keycloak: {
      url: 'http://localhost:8180',
      realm: 'unifor',
      clientId: 'unifor-frontend',
    },
  }),
});
