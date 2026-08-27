import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@unifor/shared-auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/shared/dashboard.page').then(
        (m) => m.DashboardPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/shared/unauthorized.page').then(
        (m) => m.UnauthorizedPage,
      ),
  },
  {
    path: 'matriz',
    loadChildren: () =>
      import('./features/matriz/matriz.routes').then((m) => m.MATRIZ_ROUTES),
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
  {
    path: 'matricula',
    loadChildren: () =>
      import('./features/matricula/matricula.routes').then(
        (m) => m.MATRICULA_ROUTES,
      ),
    canActivate: [authGuard, roleGuard('ALUNO')],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
