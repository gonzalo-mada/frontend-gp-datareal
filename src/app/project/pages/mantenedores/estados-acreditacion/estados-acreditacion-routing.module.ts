import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadosAcreditacionComponent } from './estados-acreditacion.component';

const routes: Routes = [
  {
    path: '',
    component: EstadosAcreditacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstadosAcreditacionRoutingModule { }
