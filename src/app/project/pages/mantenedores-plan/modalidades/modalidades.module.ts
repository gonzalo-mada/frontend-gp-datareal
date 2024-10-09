import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalidadesRoutingModule } from './modalidades-routing.module';
import { ModalidadesComponent } from './modalidades.component';

import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';

@NgModule({
  declarations: [
    ModalidadesComponent
  ],
  imports: [
    CommonModule,
    ModalidadesRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class ModalidadesModule { }
