import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriasTpRoutingModule } from './categorias-tp-routing.module';
import { CategoriasTpComponent } from './categorias-tp.component';
import { PrimengModule } from '../../../modules/primeng.module';
import { SharedModule } from '../../../modules/shared.module';


@NgModule({
  declarations: [
    CategoriasTpComponent
  ],
  imports: [
    CommonModule,
    CategoriasTpRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class CategoriasTpModule { }
