import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RangosAgRoutingModule } from './rangos-ag-routing.module';
import { RangosAgComponent } from './rangos-ag.component';

import { SharedModule } from 'src/app/project/modules/shared.module';
import { PrimengModule } from 'src/app/project/modules/primeng.module';


@NgModule({
  declarations: [
    RangosAgComponent
  ],
  imports: [
    CommonModule,
    RangosAgRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class RangosAgModule { }
