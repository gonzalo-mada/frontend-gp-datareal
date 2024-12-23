import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticulacionesComponent } from './articulaciones.component';

const routes: Routes = [
  {
    path: '',
    component: ArticulacionesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticulacionesRoutingModule { }
