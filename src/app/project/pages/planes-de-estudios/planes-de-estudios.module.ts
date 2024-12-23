import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanesDeEstudiosRoutingModule } from './planes-de-estudios-routing.module';
import { PlanesDeEstudiosComponent } from './planes-de-estudios.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { HomeComponent } from './home/home.component';
import { AgregarPlanDeEstudioComponent } from './agregar-plan-de-estudio/agregar-plan-de-estudio.component';
import { VerPlanDeEstudioComponent } from './ver-plan-de-estudio/ver-plan-de-estudio.component';
import { EditarPlanDeEstudioComponent } from './editar-plan-de-estudio/editar-plan-de-estudio.component';


@NgModule({
  declarations: [
    PlanesDeEstudiosComponent,
    HomeComponent,
    AgregarPlanDeEstudioComponent,
    VerPlanDeEstudioComponent,
    EditarPlanDeEstudioComponent
  ],
  imports: [
    CommonModule,
    PlanesDeEstudiosRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class PlanesDeEstudiosModule { }
