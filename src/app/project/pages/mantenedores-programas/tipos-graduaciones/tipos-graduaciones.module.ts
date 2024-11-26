import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraduacionesRoutingModule } from './tipos-graduaciones-routing.module';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';
import { TiposGraduacionesComponent } from './tipos-graduaciones.component';


@NgModule({
  declarations: [
    TiposGraduacionesComponent
  ],
  imports: [
    CommonModule,
    GraduacionesRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class GraduacionesModule { }
