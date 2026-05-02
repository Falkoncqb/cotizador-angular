import { Routes } from '@angular/router';
import { IngresoClientes } from './ingreso-clientes/ingreso-clientes';

export const routes: Routes = [
  { path: '', redirectTo: '/ingreso-clientes', pathMatch: 'full' },
  { path: 'ingreso-clientes', component: IngresoClientes },
];
