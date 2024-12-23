import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JornadaComponent } from './jornada.component';

const routes: Routes = [
  {
    path: '',
    component: JornadaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JornadaRoutingModule { }
