import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalidadRoutingModule } from './modalidad-routing.module';
import { ModalidadComponent } from './modalidad.component';


@NgModule({
  declarations: [
    ModalidadComponent
  ],
  imports: [
    CommonModule,
    ModalidadRoutingModule
  ]
})
export class ModalidadModule { }
