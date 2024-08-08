import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampusRoutingModule } from './campus-routing.module';
import { PrimengModule } from 'src/app/base/modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { CampusComponent } from './campus.component';


@NgModule({
  declarations: [
    CampusComponent
  ],
  imports: [
    CommonModule,
    CampusRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class CampusModule { }
