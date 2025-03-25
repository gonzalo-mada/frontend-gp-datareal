import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'programa',
    loadChildren: () => import('../pages/programas/programas.module').then((m) => m.ProgramasModule),
  },
  {
    path: 'mantenedores',
    loadChildren: () => import('../pages/mantenedores-programas/mantenedores.module').then((m) => m.MantenedoresModule),
    data: {title:'Mantenedores programa'} 
  },
  {
    path: 'mantePE',
    loadChildren: () => import('../pages/mantenedores-plan/mantenedores-plan.module').then((m) => m.MantenedoresPlanModule),
    data: {title:'Mantenedores plan estudio'} 
  },
  {
    path: 'planes',
    loadChildren: () => import('../pages/planes-de-estudios/planes-de-estudios.module').then((m) => m.PlanesDeEstudiosModule),
  },
  {
    path: 'asignaturas',
    loadChildren: () => import('../pages/asignaturas/asignaturas.module').then((m) => m.AsignaturasModule),
  },
  {
    path: 'manAsig',
    loadChildren: () => import('../pages/mantenedores-asignaturas/mantenedores-asignaturas.module').then((m) => m.MantenedoresAsignaturasModule),
    data: {title:'Mantenedores asignaturas'} 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'disabled' })],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
