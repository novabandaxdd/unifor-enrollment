import { InjectionToken } from '@angular/core';

export interface Environment {
  apiUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');
