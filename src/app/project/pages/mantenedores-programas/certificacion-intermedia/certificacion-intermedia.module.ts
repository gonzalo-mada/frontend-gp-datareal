import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificacionIntermediaRoutingModule } from './certificacion-intermedia-routing.module';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';
import { CertificacionIntermediaComponent } from './certificacion-intermedia.component';


@NgModule({
  declarations: [
    CertificacionIntermediaComponent
  ],
  imports: [
    CommonModule,
    CertificacionIntermediaRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class CertificacionIntermediaModule { }
