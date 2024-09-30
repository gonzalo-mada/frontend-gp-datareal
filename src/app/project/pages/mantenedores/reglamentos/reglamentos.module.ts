import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReglamentosRoutingModule } from './reglamentos-routing.module';
import { ReglamentosComponent } from './reglamentos.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    ReglamentosComponent
  ],
  imports: [
    CommonModule,
    ReglamentosRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class ReglamentosModule { }
