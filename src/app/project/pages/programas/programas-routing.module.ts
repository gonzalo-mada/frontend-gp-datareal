import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgramasComponent } from './programas.component';
import { HomeComponent } from './home/home.component';
import { AgregarProgramaComponent } from './agregar-programa/agregar-programa.component';
import { VerProgramaComponent } from './ver-programa/ver-programa.component';
import { EditarProgramaComponent } from './editar-programa/editar-programa.component';


const routes: Routes = [
  {
    path: '',
    component: ProgramasComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'add',
        component: AgregarProgramaComponent,
        data: {title:'Agregar programa'}
      },
      {
        path: 'show/:cod_programa',
        component: VerProgramaComponent,
        data: {title:'Ver programa'}
      },
      {
        path: 'edit/:cod_programa',
        component: EditarProgramaComponent,
        data: {title:'Actualizar programa'}
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgramasRoutingModule { }
