import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnidadesAcademicasComponent } from './unidades-academicas.component';

const routes: Routes = [
  {
    path: '',
    component: UnidadesAcademicasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnidadesAcademicasRoutingModule { }
