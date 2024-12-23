import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArticulacionesRoutingModule } from './articulaciones-routing.module';
import { ArticulacionesComponent } from './articulaciones.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    ArticulacionesComponent
  ],
  imports: [
    CommonModule,
    ArticulacionesRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class ArticulacionesModule { }
