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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenedoresPlanRoutingModule { }
