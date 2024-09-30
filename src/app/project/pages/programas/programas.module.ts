import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramasRoutingModule } from './programas-routing.module';
import { ProgramasComponent } from './programas.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { HomeComponent } from './home/home.component';
import { AgregarProgramaComponent } from './agregar-programa/agregar-programa.component';
import { VerProgramaComponent } from './ver-programa/ver-programa.component';
import { EditarProgramaComponent } from './editar-programa/editar-programa.component';


@NgModule({
  declarations: [
    ProgramasComponent,
    HomeComponent,
    AgregarProgramaComponent,
    VerProgramaComponent,
    EditarProgramaComponent
  ],
  imports: [
    CommonModule,
    ProgramasRoutingModule,
    PrimengModule,
    SharedModule,
  ]
})
export class ProgramasModule { }
