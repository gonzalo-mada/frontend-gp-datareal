import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnidadesAcademicasRoutingModule } from './unidades-academicas-routing.module';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { UnidadesAcademicasComponent } from './unidades-academicas.component';


@NgModule({
  declarations: [
    UnidadesAcademicasComponent
  ],
  imports: [
    CommonModule,
    UnidadesAcademicasRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class UnidadesAcademicasModule { }
