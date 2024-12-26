import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignaturasPlancomunComponent } from './asignaturas-plancomun.component';

const routes: Routes = [
  {
    path: '',
    component: AsignaturasPlancomunComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignaturasPlancomunRoutingModule { }
