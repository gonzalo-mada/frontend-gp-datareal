import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacultadRoutingModule } from './facultad-routing.module';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';

import { FacultadComponent } from './facultad.component';


@NgModule({
  declarations: [
    FacultadComponent
  ],
  imports: [
    CommonModule,
    FacultadRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class FacultadModule { }
