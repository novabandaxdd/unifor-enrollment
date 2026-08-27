import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@unifor/shared-auth';
import { MinhasMatriculasPage } from './minhas-matriculas.page';
import { AulasDisponiveisPage } from './aulas-disponiveis.page';

export const MATRICULA_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'minhas',
    pathMatch: 'full',
  },
  {
    path: 'minhas',
    component: MinhasMatriculasPage,
    canActivate: [authGuard, roleGuard('ALUNO')],
  },
  {
    path: 'disponiveis',
    component: AulasDisponiveisPage,
    canActivate: [authGuard, roleGuard('ALUNO')],
  },
];
