import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRoutingModule } from './routes/project-routing.module';
import { SharedModule } from './modules/shared.module';
import { PrimengModule } from './modules/primeng.module';
import { HomeComponent } from './pages/home/home.component';
import { HomeMenuButtonsComponent } from './components/shared/home-menu-buttons/home-menu-buttons.component';
import { FormMencionesComponent } from './components/plan-de-estudio/forms/form-menciones/form-menciones.component';
import { TableMencionesComponent } from './components/plan-de-estudio/tables/table-menciones/table-menciones.component';

@NgModule({
  declarations: [HomeComponent, HomeMenuButtonsComponent],
  imports: [CommonModule, ProjectRoutingModule, SharedModule, PrimengModule],
  exports: [ProjectRoutingModule],
})
export class ProjectModule {}
