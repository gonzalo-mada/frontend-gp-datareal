import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalidadesRoutingModule } from './modalidades-routing.module';
import { ModalidadComponent } from './modalidades.component';

import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';

@NgModule({
  declarations: [
    ModalidadComponent
  ],
  imports: [
    CommonModule,
    ModalidadesRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class ModalidadesModule { }