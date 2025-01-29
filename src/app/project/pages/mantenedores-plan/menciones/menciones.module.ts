import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MencionesRoutingModule } from './menciones-routing.module';
import { MencionesComponent } from './menciones.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    MencionesComponent
  ],
  imports: [
    CommonModule,
    MencionesRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class MencionesModule { }
