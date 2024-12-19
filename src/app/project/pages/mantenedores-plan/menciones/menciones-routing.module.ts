import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MencionesComponent } from './menciones.component';

const routes: Routes = [
  {
    path:'',
    component: MencionesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MencionesRoutingModule { }
