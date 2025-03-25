import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParalelaSecuencialRoutingModule } from './paralela-secuencial-routing.module';
import { ParalelaSecuencialComponent } from './paralela-secuencial.component';

import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';

@NgModule({
  declarations: [
    ParalelaSecuencialComponent
  ],
  imports: [
    CommonModule,
    ParalelaSecuencialRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class ParalelaSecuencialModule { }
