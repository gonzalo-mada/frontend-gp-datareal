import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RangosAGRoutingModule } from './rangos-ag-routing.module';
import { RangosAGComponent } from './rangos-ag.component';

import { SharedModule } from 'src/app/project/modules/shared.module';
import { PrimengModule } from 'src/app/project/modules/primeng.module';

@NgModule({
  declarations: [
    RangosAGComponent
  ],
  imports: [
    CommonModule,
    RangosAGRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class RangosAGModule { }