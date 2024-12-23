import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanesDeEstudiosComponent } from './planes-de-estudios.component';
import { HomeComponent } from './home/home.component';
import { AgregarPlanDeEstudioComponent } from './agregar-plan-de-estudio/agregar-plan-de-estudio.component';
import { VerPlanDeEstudioComponent } from './ver-plan-de-estudio/ver-plan-de-estudio.component';
import { EditarPlanDeEstudioComponent } from './editar-plan-de-estudio/editar-plan-de-estudio.component';

const routes: Routes = [
  {
    path: '',
    component: PlanesDeEstudiosComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'add',
        component: AgregarPlanDeEstudioComponent,
        data: {title: 'Agregar plan de estudio'}
      },
      {
        path: 'show/:cod_planDeEstudio',
        component: VerPlanDeEstudioComponent,
        data: {title: 'Visualización de plan de estudio'}
      },
      {
        path: 'edit/:cod_planDeEstudio',
        component: EditarPlanDeEstudioComponent,
        data: {title: 'Edición de plan de estudio'}
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanesDeEstudiosRoutingModule { }
