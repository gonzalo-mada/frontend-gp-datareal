import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignaturasRoutingModule } from './asignaturas-routing.module';
import { AsignaturasComponent } from './asignaturas.component';
import { AgregarAsignaturaComponent } from './agregar-asignatura/agregar-asignatura.component';
import { HomeComponent } from './home/home.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { VerAsignaturaComponent } from './ver-asignatura/ver-asignatura.component';
import { EditarAsignaturaComponent } from './editar-asignatura/editar-asignatura.component';


@NgModule({
  declarations: [
    AsignaturasComponent,
    HomeComponent,
    AgregarAsignaturaComponent,
    VerAsignaturaComponent,
    EditarAsignaturaComponent,
  ],
  imports: [
    CommonModule,
    AsignaturasRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class AsignaturasModule { }
