import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@unifor/shared-auth';
import { MatrizListPage } from './matriz-list.page';
import { MatrizCreatePage } from './matriz-create.page';
import { MatrizEditPage } from './matriz-edit.page';

export const MATRIZ_ROUTES: Routes = [
  {
    path: '',
    component: MatrizListPage,
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
  {
    path: 'criar',
    component: MatrizCreatePage,
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
  {
    path: 'editar/:id',
    component: MatrizEditPage,
    canActivate: [authGuard, roleGuard('COORDENADOR')],
  },
];
