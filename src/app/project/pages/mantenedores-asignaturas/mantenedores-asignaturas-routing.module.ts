import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MantenedoresAsignaturasComponent } from './mantenedores-asignaturas.component';

const routes: Routes = [
	{
		path: '',
		component: MantenedoresAsignaturasComponent
	},
	{
		path: 'prerequisitos',
		loadChildren: () => import('../mantenedores-asignaturas/prerrequisitos/prerrequisitos.module').then((j) => j.PrerrequisitosModule),
		title: 'Prerrequisitos'
	},
	{
		path: 'parsel',
		loadChildren: () => import('../mantenedores-asignaturas/paralela-secuencial/paralela-secuencial.module').then((j) => j.ParalelaSecuencialModule),
		title: 'Paralelo / Secuencial'
	},
	{
		path: 'temas',
		loadChildren: () => import('../mantenedores-asignaturas/temas/temas.module').then((j) => j.TemasModule),
		title: 'Temas'
	}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenedoresAsignaturasRoutingModule { }
