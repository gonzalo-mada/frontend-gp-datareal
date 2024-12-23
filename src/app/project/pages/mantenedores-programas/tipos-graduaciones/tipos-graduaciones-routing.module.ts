import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiposGraduacionesComponent } from './tipos-graduaciones.component';

const routes: Routes = [
  {
    path: '',
    component: TiposGraduacionesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraduacionesRoutingModule { }
