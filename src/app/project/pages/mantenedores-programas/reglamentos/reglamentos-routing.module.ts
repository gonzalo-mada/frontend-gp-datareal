import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReglamentosComponent } from './reglamentos.component';

const routes: Routes = [
  {
    path: '',
    component: ReglamentosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReglamentosRoutingModule { }
