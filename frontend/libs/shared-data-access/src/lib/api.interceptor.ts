import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Keycloak } from 'keycloak-angular';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);
  return from(keycloak.getToken()).pipe(
    switchMap((token) => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
  );
};
