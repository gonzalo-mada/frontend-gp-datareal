import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JornadaRoutingModule } from './jornada-routing.module';
import { JornadaComponent } from './jornada.component';


@NgModule({
  declarations: [
    JornadaComponent
  ],
  imports: [
    CommonModule,
    JornadaRoutingModule
  ]
})
export class JornadaModule { }
