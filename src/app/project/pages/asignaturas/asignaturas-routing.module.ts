import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignaturasComponent } from './asignaturas.component';
import { HomeComponent } from './home/home.component';
import { AgregarAsignaturaComponent } from './agregar-asignatura/agregar-asignatura.component';

const routes: Routes = [
  {
    path: '',
    component: AsignaturasComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'add',
        component: AgregarAsignaturaComponent,
        data: {title: 'Agregar asignatura'}
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignaturasRoutingModule { }
