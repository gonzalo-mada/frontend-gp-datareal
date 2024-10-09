import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { TranslateModule } from '@ngx-translate/core';
//pipes
import { FileSizePipe } from '../tools/pipes/file-size.pipe';
import { FileExtensionPipe } from '../tools/pipes/file-extension.pipe';
// components base to gp
import { FormIsvalidComponent } from 'src/app/base/components/form-isvalid/form-isvalid.component';
import { FormControlComponent } from 'src/app/base/components/form-control/form-control.component';
//components gp
import { CardComponent } from '../components/card/card.component';
import { MenuButtonsTableComponent } from '../components/menu-buttons-table/menu-buttons-table.component';
import { DialogComponent } from '../components/dialog/dialog.component';
import { UploaderFilesComponent } from '../components/uploader-files/uploader-files.component';
import { TableCampusComponent } from '../components/tables/table-campus/table-campus.component';
import { DialogVisorPdfComponent } from '../components/dialog-visor-pdf/dialog-visor-pdf.component';
import { TableFacultadComponent } from '../components/tables/table-facultad/table-facultad.component';
import { TableTiposProgramasComponent } from '../components/tables/table-tipos-programas/table-tipos-programas.component';
import { TableCategoriasTpComponent } from '../components/tables/table-categorias-tp/table-categorias-tp.component';
import { FormCategoriasTpComponent } from '../components/forms/form-categorias-tp/form-categorias-tp.component';
import { TableUnidadesAcademicasComponent } from '../components/tables/table-unidades-academicas/table-unidades-academicas.component';
import { TableEstadosAcreditacionComponent } from '../components/tables/table-estados-acreditacion/table-estados-acreditacion.component';
import { FormEstadosAcreditacionComponent } from '../components/forms/form-estados-acreditacion/form-estados-acreditacion.component';
import { BreadcrumbgpComponent } from '../components/breadcrumbgp/breadcrumbgp.component';
import { TableProgramasDirectoresComponent } from '../components/tables/programas/table-programas-directores/table-programas-directores.component';
import { ConfigModeComponent } from '../components/config-mode/config-mode.component';
import { TableProgramasEstadosAcreditacionComponent } from '../components/tables/programas/table-programas-estados-acreditacion/table-programas-estados-acreditacion.component';
import { FormSuspensionComponent } from '../components/forms/form-suspension/form-suspension.component';
import { TableProgramasSuspensionesComponent } from '../components/tables/programas/table-programas-suspensiones/table-programas-suspensiones.component';
import { TableSuspensionesComponent } from '../components/tables/table-suspensiones/table-suspensiones.component';
import { TableProgramasComponent } from '../components/tables/table-programas/table-programas.component';
import { TableReglamentosComponent } from '../components/tables/table-reglamentos/table-reglamentos.component';
import { FormReglamentosComponent } from '../components/forms/form-reglamentos/form-reglamentos.component';
import { TableProgramasReglamentosComponent } from '../components/tables/programas/table-programas-reglamentos/table-programas-reglamentos.component';
import { StateFormComponent } from '../components/state-form/state-form.component';
import { FormProgramasStepOneComponent } from '../components/forms/programas/form-programas-step-one/form-programas-step-one.component';
import { FormProgramasStepTwoComponent } from '../components/forms/programas/form-programas-step-two/form-programas-step-two.component';
import { FormProgramasViewAndEditComponent } from '../components/forms/programas/form-programas-view-and-edit/form-programas-view-and-edit.component';
import { TableProgramasEstadoMaestroComponent } from '../components/tables/programas/table-programas-estado-maestro/table-programas-estado-maestro.component';
import { TableProgramasTituloComponent } from '../components/tables/programas/table-programas-titulo/table-programas-titulo.component';
import { TableProgramasGradoAcademicoComponent } from '../components/tables/programas/table-programas-grado-academico/table-programas-grado-academico.component';
import { TableProgramasRexeComponent } from '../components/tables/programas/table-programas-rexe/table-programas-rexe.component';
import { TableProgramasDirectorComponent } from '../components/tables/programas/table-programas-director/table-programas-director.component';
import { TableProgramasDirectorAlternoComponent } from '../components/tables/programas/table-programas-director-alterno/table-programas-director-alterno.component';

const componentsGp = [
  BreadcrumbgpComponent,
  CardComponent,
  ConfigModeComponent,
  DialogComponent,
  DialogVisorPdfComponent,
  FormCategoriasTpComponent,
  FormEstadosAcreditacionComponent,
  FormProgramasStepOneComponent,
  FormProgramasStepTwoComponent,
  FormProgramasViewAndEditComponent,
  FormReglamentosComponent,
  FormSuspensionComponent,
  MenuButtonsTableComponent,
  UploaderFilesComponent,
  StateFormComponent,
  TableCampusComponent,
  TableCategoriasTpComponent,
  TableEstadosAcreditacionComponent,
  TableFacultadComponent,
  TableTiposProgramasComponent,
  TableProgramasComponent,
  TableProgramasDirectorComponent,
  TableProgramasDirectorAlternoComponent,
  TableProgramasDirectoresComponent,
  TableProgramasEstadosAcreditacionComponent,
  TableProgramasEstadoMaestroComponent,
  TableProgramasGradoAcademicoComponent,
  TableProgramasReglamentosComponent,
  TableProgramasRexeComponent,
  TableProgramasSuspensionesComponent,
  TableProgramasTituloComponent,
  TableReglamentosComponent,
  TableSuspensionesComponent,
  TableUnidadesAcademicasComponent
]

@NgModule({
  declarations: [
    //pipes
    FileSizePipe,
    FileExtensionPipe,
    ...componentsGp,
  ],
  imports: [
    CommonModule,
    PrimengModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    //components base to gp
    FormIsvalidComponent,
    FormControlComponent,
  ],
  exports: [
    CommonModule,
    PrimengModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    //pipes
    FileSizePipe,
    FileExtensionPipe,
    //components base to gp
    FormIsvalidComponent,
    FormControlComponent,
    //components gp
    ...componentsGp
  ],
})
export class SharedModule {}
