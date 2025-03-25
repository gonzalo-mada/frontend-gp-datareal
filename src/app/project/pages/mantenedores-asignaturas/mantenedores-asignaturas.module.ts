import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MantenedoresAsignaturasRoutingModule } from './mantenedores-asignaturas-routing.module';
import { MantenedoresAsignaturasComponent } from './mantenedores-asignaturas.component';

import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';

@NgModule({
  declarations: [
    MantenedoresAsignaturasComponent
  ],
  imports: [
    CommonModule,
    MantenedoresAsignaturasRoutingModule,
	PrimengModule,
    SharedModule
  ]
})
export class MantenedoresAsignaturasModule { }
