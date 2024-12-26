import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificacionesIntermediasComponent } from './certificaciones-intermedias.component';

const routes: Routes = [
  {
    path: '',
    component: CertificacionesIntermediasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificacionesIntermediasRoutingModule { }
