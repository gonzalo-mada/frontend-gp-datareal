import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JornadaRoutingModule } from './jornada-routing.module';
import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';
import { JornadaComponent } from './jornada.component';


@NgModule({
  declarations: [
    JornadaComponent
  ],
  imports: [
    CommonModule,
    JornadaRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class JornadaModule { }
