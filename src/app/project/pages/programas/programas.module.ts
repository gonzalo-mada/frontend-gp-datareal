import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramasRoutingModule } from './programas-routing.module';
import { ProgramasComponent } from './programas.component';
import { PrimengModule } from '../../modules/primeng.module';
import { SharedModule } from '../../modules/shared.module';
import { HomeComponent } from './home/home.component';
import { AgregarProgramaComponent } from './agregar-programa/agregar-programa.component';


@NgModule({
  declarations: [
    ProgramasComponent,
    HomeComponent,
    AgregarProgramaComponent
  ],
  imports: [
    CommonModule,
    ProgramasRoutingModule,
    PrimengModule,
    SharedModule,
  ]
})
export class ProgramasModule { }
