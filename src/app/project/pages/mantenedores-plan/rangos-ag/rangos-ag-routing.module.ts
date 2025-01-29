import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RangosAgComponent } from './rangos-ag.component';

const routes: Routes = [
  {
    path:'',
    component: RangosAgComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RangosAgRoutingModule { }