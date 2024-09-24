import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MantenedoresRoutingModule } from './mantenedores-routing.module';
import { MantenedoresComponent } from './mantenedores.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';


@NgModule({
  declarations: [
    MantenedoresComponent
  ],
  imports: [
    CommonModule,
    MantenedoresRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class MantenedoresModule { }
