import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RangosAGComponent } from './rangos-ag.component';

const routes: Routes = [
  {
    path:'',
    component: RangosAGComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RangosAGRoutingModule { }