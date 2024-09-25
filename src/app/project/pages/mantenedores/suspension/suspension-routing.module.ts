import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuspensionComponent } from './suspension.component';

const routes: Routes = [
  {
    path: '',
    component: SuspensionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuspensionRoutingModule { }
