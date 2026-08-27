import { Environment } from '@unifor/shared-data-access';

export const environment: Environment & { production: boolean } = {
  production: true,
  apiUrl: '/api',
  keycloak: {
    url: '/auth',
    realm: 'unifor',
    clientId: 'unifor-frontend',
  },
};
