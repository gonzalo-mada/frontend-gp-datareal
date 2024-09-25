import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuspensionRoutingModule } from './suspension-routing.module';
import { SuspensionComponent } from './suspension.component';
import { PrimengModule } from 'src/app/project/modules/primeng.module';
import { SharedModule } from 'src/app/project/modules/shared.module';


@NgModule({
  declarations: [
    SuspensionComponent
  ],
  imports: [
    CommonModule,
    SuspensionRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class SuspensionModule { }
