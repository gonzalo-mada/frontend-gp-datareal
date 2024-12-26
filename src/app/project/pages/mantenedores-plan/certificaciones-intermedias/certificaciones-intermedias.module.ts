import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificacionesIntermediasRoutingModule } from './certificaciones-intermedias-routing.module';
import { CertificacionesIntermediasComponent } from './certificaciones-intermedias.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    CertificacionesIntermediasComponent
  ],
  imports: [
    CommonModule,
    CertificacionesIntermediasRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class CertificacionesIntermediasModule { }
