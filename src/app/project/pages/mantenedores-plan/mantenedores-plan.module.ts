import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MantenedoresPlanComponent } from './mantenedores-plan.component';
import { MantenedoresPlanRoutingModule } from './mantenedores-plan-routing.module';

import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';

@NgModule({
  declarations: [
    MantenedoresPlanComponent
  ],
  imports: [
    CommonModule,
    MantenedoresPlanRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class MantenedoresPlanModule { }
