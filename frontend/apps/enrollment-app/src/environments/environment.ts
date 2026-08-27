import { Environment } from '@unifor/shared-data-access';

export const environment: Environment & { production: boolean } = {
  production: false,
  apiUrl: 'http://localhost:8080',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'unifor',
    clientId: 'unifor-frontend',
  },
};
