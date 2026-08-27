import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    // Coordinator module — lazy-loaded (implemented in Phase 5)
    path: 'matriz',
    loadChildren: () =>
      import('./features/matriz/matriz.routes').then((m) => m.MATRIZ_ROUTES),
  },
  {
    // Student module — lazy-loaded (implemented in Phase 6)
    path: 'matricula',
    loadChildren: () =>
      import('./features/matricula/matricula.routes').then((m) => m.MATRICULA_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
