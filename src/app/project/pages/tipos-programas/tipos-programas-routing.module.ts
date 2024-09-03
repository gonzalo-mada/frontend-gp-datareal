import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiposProgramasComponent } from './tipos-programas.component';

const routes: Routes = [
  {
    path: '',
    component: TiposProgramasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiposProgramasRoutingModule { }
