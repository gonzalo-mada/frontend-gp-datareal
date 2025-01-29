import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegimenComponent } from './regimen.component';

const routes: Routes = [
  {
    path: '',
    component: RegimenComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegimenRoutingModule { }