import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriasTpComponent } from './categorias-tp.component';

const routes: Routes = [
  {
    path: '',
    component: CategoriasTpComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriasTpRoutingModule { }
