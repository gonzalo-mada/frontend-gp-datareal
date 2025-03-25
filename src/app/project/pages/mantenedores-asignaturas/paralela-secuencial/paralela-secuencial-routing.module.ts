import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParalelaSecuencialComponent } from './paralela-secuencial.component';

const routes: Routes = [
    {
      path: '',
      component: ParalelaSecuencialComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParalelaSecuencialRoutingModule { }
