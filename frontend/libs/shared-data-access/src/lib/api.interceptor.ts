import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { from, switchMap } from 'rxjs';

/**
 * HTTP interceptor that attaches the Keycloak Bearer token to every outgoing request.
 * Uses keycloak-angular v20 API: inject(Keycloak) from keycloak-js directly.
 * updateToken(30) ensures the token is refreshed if it expires within 30 seconds.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);

  if (!keycloak.authenticated) {
    return next(req);
  }

  return from(
    keycloak
      .updateToken(30)
      .then(() => keycloak.token ?? '')
      .catch(() => keycloak.token ?? '')
  ).pipe(
    switchMap((token) => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authReq);
    })
  );
};
