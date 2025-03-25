import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrerrequisitosRoutingModule } from './prerrequisitos-routing.module';
import { PrerrequisitosComponent } from './prerrequisitos.component';

import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';

@NgModule({
  declarations: [
    PrerrequisitosComponent
  ],
  imports: [
    CommonModule,
    PrerrequisitosRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class PrerrequisitosModule { }
