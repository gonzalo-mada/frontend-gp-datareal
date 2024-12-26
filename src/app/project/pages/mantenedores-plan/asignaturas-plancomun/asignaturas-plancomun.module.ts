import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignaturasPlancomunRoutingModule } from './asignaturas-plancomun-routing.module';
import { AsignaturasPlancomunComponent } from './asignaturas-plancomun.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    AsignaturasPlancomunComponent
  ],
  imports: [
    CommonModule,
    AsignaturasPlancomunRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class AsignaturasPlancomunModule { }
