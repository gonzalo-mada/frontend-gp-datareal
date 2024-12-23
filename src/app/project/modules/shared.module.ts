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
import { NgxSpinnerModule } from 'ngx-spinner';
//components gp
import { CardComponent } from 'src/app/project/components/shared/card/card.component';
import { MenuButtonsTableComponent } from 'src/app/project/components/shared/menu-buttons-table/menu-buttons-table.component';
import { DialogComponent } from 'src/app/project/components/shared/dialog/dialog.component';
import { UploaderFilesComponent } from 'src/app/project/components/shared/uploader-files/uploader-files.component';
import { TableCampusComponent } from 'src/app/project/components/programas/tables/table-campus/table-campus.component';
import { DialogVisorPdfComponent } from 'src/app/project/components/shared/dialog-visor-pdf/dialog-visor-pdf.component';
import { TableFacultadComponent } from 'src/app/project/components/programas/tables/table-facultad/table-facultad.component';
import { TableTiposProgramasComponent } from 'src/app/project/components/programas/tables/table-tipos-programas/table-tipos-programas.component';
import { TableCategoriasTpComponent } from 'src/app/project/components/programas/tables/table-categorias-tp/table-categorias-tp.component';
import { FormCategoriasTpComponent } from 'src/app/project/components/programas/forms/form-categorias-tp/form-categorias-tp.component';
import { TableUnidadesAcademicasComponent } from 'src/app/project/components/programas/tables/table-unidades-academicas/table-unidades-academicas.component';
import { TableEstadosAcreditacionComponent } from 'src/app/project/components/programas/tables/table-estados-acreditacion/table-estados-acreditacion.component';
import { FormEstadosAcreditacionComponent } from 'src/app/project/components/programas/forms/form-estados-acreditacion/form-estados-acreditacion.component';
import { BreadcrumbgpComponent } from 'src/app/project/components/shared/breadcrumbgp/breadcrumbgp.component';
import { TableProgramasDirectoresComponent } from 'src/app/project/components/programas/tables/programas/table-programas-directores/table-programas-directores.component';
import { ConfigModeComponent } from 'src/app/project/components/shared/config-mode/config-mode.component';
import { TableProgramasEstadosAcreditacionComponent } from 'src/app/project/components/programas/tables/programas/table-programas-estados-acreditacion/table-programas-estados-acreditacion.component';
import { FormSuspensionComponent } from 'src/app/project/components/programas/forms/form-suspension/form-suspension.component';
import { TableSuspensionesComponent } from 'src/app/project/components/programas/tables/table-suspensiones/table-suspensiones.component';
import { TableProgramasComponent } from 'src/app/project/components/programas/tables/table-programas/table-programas.component';
import { TableReglamentosComponent } from 'src/app/project/components/programas/tables/table-reglamentos/table-reglamentos.component';
import { FormReglamentosComponent } from 'src/app/project/components/programas/forms/form-reglamentos/form-reglamentos.component';
import { TableProgramasReglamentosComponent } from 'src/app/project/components/programas/tables/programas/table-programas-reglamentos/table-programas-reglamentos.component';
import { TableJornadasComponent } from 'src/app/project/components/plan-de-estudio/tables/table-jornadas/table-jornadas/table-jornadas.component';
import { FormJornadasComponent } from 'src/app/project/components/plan-de-estudio/forms/form-jornadas/form-jornadas/form-jornadas.component';
import { FormModalidadesComponent } from 'src/app/project/components/plan-de-estudio/forms/form-modalidades/form-modalidades/form-modalidades.component';
import { TableModalidadesComponent } from 'src/app/project/components/plan-de-estudio/tables/table-modalidades/table-modalidades/table-modalidades.component';
import { StateFormComponent } from 'src/app/project/components/shared/state-form/state-form.component';
import { FormProgramasStepOneComponent } from 'src/app/project/components/programas/forms/programas/form-programas-step-one/form-programas-step-one.component';
import { FormProgramasStepTwoComponent } from 'src/app/project/components/programas/forms/programas/form-programas-step-two/form-programas-step-two.component';
import { FormProgramasUpdateComponent } from '../components/programas/forms/programas/form-programas-update/form-programas-update.component';
import { FormProgramasViewAndEditComponent } from 'src/app/project/components/programas/forms/programas/form-programas-view-and-edit/form-programas-view-and-edit.component';
import { TableProgramasEstadoMaestroComponent } from 'src/app/project/components/programas/tables/programas/table-programas-estado-maestro/table-programas-estado-maestro.component';
import { TableProgramasTituloComponent } from 'src/app/project/components/programas/tables/programas/table-programas-titulo/table-programas-titulo.component';
import { TableProgramasGradoAcademicoComponent } from 'src/app/project/components/programas/tables/programas/table-programas-grado-academico/table-programas-grado-academico.component';
import { TableProgramasRexeComponent } from 'src/app/project/components/programas/tables/programas/table-programas-rexe/table-programas-rexe.component';
import { TableProgramasDirectorComponent } from 'src/app/project/components/programas/tables/programas/table-programas-director/table-programas-director.component';
import { TableProgramasDirectorAlternoComponent } from 'src/app/project/components/programas/tables/programas/table-programas-director-alterno/table-programas-director-alterno.component';
import { TableProgramasHistorialActividadComponent } from 'src/app/project/components/programas/tables/programas/table-programas-historial-actividad/table-programas-historial-actividad.component';
import { LoadinggpComponent } from 'src/app/project/components/shared/loadinggp/loadinggp.component';
import { TableProgramasDocsMaestroComponent } from '../components/programas/tables/programas/table-programas-docs-maestro/table-programas-docs-maestro.component';
import { TableTiposGraduacionesComponent } from 'src/app/project/components/programas/tables/table-tipos-graduaciones/table-tipos-graduaciones.component';
import { FormTiposGraduacionComponent } from 'src/app/project/components/programas/forms/form-tipos-graduacion/form-tipos-graduacion.component';
import { TableCertificacionesIntermediasComponent } from 'src/app/project/components/programas/tables/table-certificaciones-intermedias/table-certificaciones-intermedias.component';
import { FormCertificacionesIntermediasComponent } from 'src/app/project/components/programas/forms/form-certificaciones-intermedias/form-certificaciones-intermedias.component';
import { FormArticulacionesComponent } from '../components/plan-de-estudio/forms/form-articulaciones/form-articulaciones.component';
import { TableArticulacionesComponent } from '../components/plan-de-estudio/tables/table-articulaciones/table-articulaciones.component';
import { TablePlanDeEstudioComponent } from '../components/plan-de-estudio/tables/table-plan-de-estudio/table-plan-de-estudio.component';


const componentsGp = [
  BreadcrumbgpComponent,
  CardComponent,
  ConfigModeComponent,
  DialogComponent,
  DialogVisorPdfComponent,
  FormArticulacionesComponent,
  FormCategoriasTpComponent,
  FormCertificacionesIntermediasComponent,
  FormEstadosAcreditacionComponent,
  FormProgramasStepOneComponent,
  FormProgramasStepTwoComponent,
  FormProgramasUpdateComponent,
  FormProgramasViewAndEditComponent,
  FormReglamentosComponent,
  FormSuspensionComponent,
  FormJornadasComponent,
  FormModalidadesComponent,
  FormTiposGraduacionComponent,
  FormRegimenesComponent,
  FormMencionesComponent,
  FormRangosAgComponent,
  LoadinggpComponent,
  MenuButtonsTableComponent,
  UploaderFilesComponent,
  StateFormComponent,
  TableArticulacionesComponent,
  TableCampusComponent,
  TableCategoriasTpComponent,
  TableCertificacionesIntermediasComponent,
  TableEstadosAcreditacionComponent,
  TableFacultadComponent,
  TableTiposGraduacionesComponent,
  TableTiposProgramasComponent,
  TableProgramasComponent,
  TableProgramasDirectorComponent,
  TableProgramasDirectorAlternoComponent,
  TableProgramasDirectoresComponent,
  TableProgramasDocsMaestroComponent,
  TableProgramasEstadosAcreditacionComponent,
  TableProgramasEstadoMaestroComponent,
  TableProgramasGradoAcademicoComponent,
  TableProgramasHistorialActividadComponent,
  TableProgramasReglamentosComponent,
  TableProgramasRexeComponent,
  TableProgramasTituloComponent,
  TableReglamentosComponent,
  TablePlanDeEstudioComponent,
  TableSuspensionesComponent,
  TableUnidadesAcademicasComponent,
  TableJornadasComponent,
  TableModalidadesComponent,
  TableRegimenesComponent,
  TableMencionesComponent,
  TableRangosAgComponent
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
    NgxSpinnerModule
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
