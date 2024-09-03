import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TiposProgramasRoutingModule } from './tipos-programas-routing.module';
import { TiposProgramasComponent } from './tipos-programas.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';


@NgModule({
  declarations: [
    TiposProgramasComponent
  ],
  imports: [
    CommonModule,
    TiposProgramasRoutingModule,
    PrimengModule,
    SharedModule

  ]
})
export class TiposProgramasModule { }
