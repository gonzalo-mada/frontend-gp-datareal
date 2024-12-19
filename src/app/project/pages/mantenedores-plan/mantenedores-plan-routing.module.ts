import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MantenedoresPlanComponent } from './mantenedores-plan.component';

const routes: Routes = [
  {
    path: '',
    component: MantenedoresPlanComponent,
  },
  {
    path: 'jornadas',
    loadChildren: () => import('../mantenedores-plan/jornada/jornada.module').then((j) => j.JornadaModule),
    title: 'Jornadas'
  },
  {
    path: 'modalidades',
    loadChildren: () => import('../mantenedores-plan/modalidades/modalidades.module').then((j) => j.ModalidadesModule),
    title: 'Modalidades'
  },
  {
    path: 'regimenes',
    loadChildren: () => import('../mantenedores-plan/regimen/regimen.module').then((r) => r.RegimenModule),
    title: 'Regímenes'
  },
  {
    path: 'menciones',
    loadChildren: () => import('../mantenedores-plan/menciones/menciones.module').then((m) => m.MencionesModule),
    title: 'Menciones'
  },
  {
    path: 'certificaciones',
    loadChildren: () => import('../mantenedores-plan/rangos-ag/rangos-ag.module').then((m) => m.RangosAGModule),
    title: 'Rangos de aprobación de grados'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenedoresPlanRoutingModule { }
