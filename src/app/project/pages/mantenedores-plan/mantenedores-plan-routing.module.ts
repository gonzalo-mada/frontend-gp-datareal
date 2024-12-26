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
    path: 'articulaciones',
    loadChildren: () => import('../mantenedores-plan/articulaciones/articulaciones.module').then((j) => j.ArticulacionesModule),
    title: 'Articulaciones'
  },
  {
    path: 'certificacionIntermedia',
    loadChildren: () => import('../mantenedores-plan/certificaciones-intermedias/certificaciones-intermedias.module').then((j) => j.CertificacionesIntermediasModule),
    title: 'Certificaciones intermedias'
  },
  {
    path: 'asigPlanComun',
    loadChildren: () => import('../mantenedores-plan/asignaturas-plancomun/asignaturas-plancomun.module').then((j) => j.AsignaturasPlancomunModule),
    title: 'Asignaturas plan común'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenedoresPlanRoutingModule { }
