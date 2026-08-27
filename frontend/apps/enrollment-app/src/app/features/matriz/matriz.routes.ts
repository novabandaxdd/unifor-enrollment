import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@unifor/shared-auth';

export const MATRIZ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./matriz-list.page').then((m) => m.MatrizListPage),
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./matriz-create.page').then((m) => m.MatrizCreatePage),
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./matriz-edit.page').then((m) => m.MatrizEditPage),
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
];
