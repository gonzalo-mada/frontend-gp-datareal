import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignaturasComponent } from './asignaturas.component';
import { HomeComponent } from './home/home.component';
import { AgregarAsignaturaComponent } from './agregar-asignatura/agregar-asignatura.component';
import { VerAsignaturaComponent } from './ver-asignatura/ver-asignatura.component';
import { EditarAsignaturaComponent } from './editar-asignatura/editar-asignatura.component';

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
		},
		{
			path: 'show/:cod_asignatura',
			component: VerAsignaturaComponent,
			data: {title: 'Visualización de asignatura'}
		},
		{
			path: 'edit/:cod_asignatura',
			component: EditarAsignaturaComponent,
			data: {title: 'Edición de asignatura'}
		}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignaturasRoutingModule { }
