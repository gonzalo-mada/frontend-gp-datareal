import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrerrequisitosComponent } from './prerrequisitos.component';

const routes: Routes = [
  {
    path: '',
    component: PrerrequisitosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrerrequisitosRoutingModule { }
