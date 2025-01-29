import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignaturasRoutingModule } from './asignaturas-routing.module';
import { AsignaturasComponent } from './asignaturas.component';
import { AgregarAsignaturaComponent } from './agregar-asignatura/agregar-asignatura.component';
import { HomeComponent } from './home/home.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';


@NgModule({
  declarations: [
    AsignaturasComponent,
    HomeComponent,
    AgregarAsignaturaComponent,
  ],
  imports: [
    CommonModule,
    AsignaturasRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class AsignaturasModule { }
