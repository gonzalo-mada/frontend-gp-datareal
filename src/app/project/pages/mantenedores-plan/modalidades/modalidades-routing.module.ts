import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalidadComponent } from './modalidades.component';

const routes: Routes = [
  {
    path:'',
    component: ModalidadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModalidadesRoutingModule { }
