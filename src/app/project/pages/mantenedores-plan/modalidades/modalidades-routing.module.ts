import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalidadesComponent } from './modalidades.component';

const routes: Routes = [
  {
    path:'',
    component: ModalidadesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModalidadesRoutingModule { }
