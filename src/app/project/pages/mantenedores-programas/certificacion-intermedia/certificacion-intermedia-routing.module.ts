import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificacionIntermediaComponent } from './certificacion-intermedia.component';

const routes: Routes = [
  {
    path: '',
    component: CertificacionIntermediaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificacionIntermediaRoutingModule { }
