import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegimenComponent } from './regimen.component';
import { RegimenRoutingModule } from './regimen-routing.module';

import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';

@NgModule({
  declarations: [
    RegimenComponent
  ],
  imports: [
    CommonModule,
    RegimenRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class RegimenModule { }
