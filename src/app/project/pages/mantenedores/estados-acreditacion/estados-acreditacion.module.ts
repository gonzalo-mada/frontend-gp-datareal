import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstadosAcreditacionRoutingModule } from './estados-acreditacion-routing.module';
import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';
import { EstadosAcreditacionComponent } from './estados-acreditacion.component';


@NgModule({
  declarations: [
    EstadosAcreditacionComponent
  ],
  imports: [
    CommonModule,
    EstadosAcreditacionRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class EstadosAcreditacionModule { }
