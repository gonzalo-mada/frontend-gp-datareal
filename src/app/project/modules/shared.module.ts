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
import { FormSuspensionComponent } from 'src/app/project/components/programas/forms/form-suspension/form-suspension.component';
import { TableSuspensionesComponent } from 'src/app/project/components/programas/tables/table-suspensiones/table-suspensiones.component';
import { TableProgramasComponent } from 'src/app/project/components/programas/tables/table-programas/table-programas.component';
import { TableReglamentosComponent } from 'src/app/project/components/programas/tables/table-reglamentos/table-reglamentos.component';
import { FormReglamentosComponent } from 'src/app/project/components/programas/forms/form-reglamentos/form-reglamentos.component';
import { TableJornadasComponent } from 'src/app/project/components/plan-de-estudio/tables/table-jornadas/table-jornadas/table-jornadas.component';
import { FormJornadasComponent } from 'src/app/project/components/plan-de-estudio/forms/form-jornadas/form-jornadas/form-jornadas.component';
import { FormModalidadesComponent } from 'src/app/project/components/plan-de-estudio/forms/form-modalidades/form-modalidades/form-modalidades.component';
import { TableModalidadesComponent } from 'src/app/project/components/plan-de-estudio/tables/table-modalidades/table-modalidades/table-modalidades.component';
import { StateFormComponent } from 'src/app/project/components/shared/state-form/state-form.component';
import { FormProgramasUpdateComponent } from '../components/programas/forms/programas/form-programas-update/form-programas-update.component';
import { FormProgramasViewAndEditComponent } from 'src/app/project/components/programas/forms/programas/form-programas-view-and-edit/form-programas-view-and-edit.component';
import { TableProgramasHistorialActividadComponent } from 'src/app/project/components/programas/tables/programas/table-programas-historial-actividad/table-programas-historial-actividad.component';
import { LoadinggpComponent } from 'src/app/project/components/shared/loadinggp/loadinggp.component';
import { TableTiposGraduacionesComponent } from 'src/app/project/components/programas/tables/table-tipos-graduaciones/table-tipos-graduaciones.component';
import { FormTiposGraduacionComponent } from 'src/app/project/components/programas/forms/form-tipos-graduacion/form-tipos-graduacion.component';
import { TableCertificacionesIntermediasComponent } from 'src/app/project/components/programas/tables/table-certificaciones-intermedias/table-certificaciones-intermedias.component';
import { FormCertificacionesIntermediasComponent } from 'src/app/project/components/programas/forms/form-certificaciones-intermedias/form-certificaciones-intermedias.component';
import { FormArticulacionesComponent } from '../components/plan-de-estudio/forms/form-articulaciones/form-articulaciones.component';
import { TableArticulacionesComponent } from '../components/plan-de-estudio/tables/table-articulaciones/table-articulaciones.component';
import { TablePlanDeEstudioComponent } from '../components/plan-de-estudio/tables/table-plan-de-estudio/table-plan-de-estudio.component';
import { FormCertificacionesIntermediasPeComponent } from '../components/plan-de-estudio/forms/form-certificaciones-intermedias-pe/form-certificaciones-intermedias-pe.component';
import { TableCertificacionesIntermediasPeComponent } from '../components/plan-de-estudio/tables/table-certificaciones-intermedias-pe/table-certificaciones-intermedias-pe.component';
import { FormAsignaturasPlancomunComponent } from '../components/plan-de-estudio/forms/form-asignaturas-plancomun/form-asignaturas-plancomun.component';
import { TableAsignaturasPlancomunComponent } from '../components/plan-de-estudio/tables/table-asignaturas-plancomun/table-asignaturas-plancomun.component';
import { FormPeViewAndEditComponent } from '../components/plan-de-estudio/forms/plan-de-estudio/form-pe-view-and-edit/form-pe-view-and-edit.component';
import { FormPeUpdateComponent } from '../components/plan-de-estudio/forms/plan-de-estudio/form-pe-update/form-pe-update.component';
import { FormMencionesComponent } from '../components/plan-de-estudio/forms/form-menciones/form-menciones.component';
import { FormTemasComponent } from '../components/asignaturas/forms/form-temas/form-temas.component';
import { TableMencionesComponent } from '../components/plan-de-estudio/tables/table-menciones/table-menciones.component';
import { TableRegimenesComponent } from '../components/plan-de-estudio/tables/table-regimenes/table-regimenes.component';
import { FormRegimenesComponent } from '../components/plan-de-estudio/forms/form-regimenes/form-regimenes.component';
import { FormRangosAgComponent } from '../components/plan-de-estudio/forms/form-rangos-ag/form-rangos-ag.component';
import { TableRangosAgComponent } from '../components/plan-de-estudio/tables/table-rangos-ag/table-rangos-ag.component';
import { HistorialActividadComponent } from '../components/shared/historial-actividad/historial-actividad.component';
import { TableAsignaturasComponent } from '../components/asignaturas/tables/table-asignaturas/table-asignaturas.component';
import { FormAsignViewAndEditComponent } from '../components/asignaturas/forms/asignaturas/form-asign-view-and-edit/form-asign-view-and-edit.component';
import { FormAsignUpdateComponent } from '../components/asignaturas/forms/asignaturas/form-asign-update/form-asign-update.component';
import { FormPrerrequisitosComponent } from '../components/asignaturas/forms/form-prerrequisitos/form-prerrequisitos.component';
import { TablePrerrequisitosComponent } from '../components/asignaturas/tables/table-prerrequisitos/table-prerrequisitos.component';
import { TableParalelaSecuencialComponent } from '../components/asignaturas/tables/table-paralela-secuencial/table-paralela-secuencial.component';
import { FormParalelaSecuencialComponent } from '../components/asignaturas/forms/form-paralela-secuencial/form-paralela-secuencial.component';
import { TableTemasComponent } from '../components/asignaturas/tables/table-temas/table-temas.component';

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
  FormMencionesComponent,
  FormProgramasUpdateComponent,
  FormProgramasViewAndEditComponent,
  FormReglamentosComponent,
  FormSuspensionComponent,
  FormJornadasComponent,
  FormCertificacionesIntermediasPeComponent,
  FormAsignaturasPlancomunComponent,
  FormPeViewAndEditComponent,
  FormPeUpdateComponent,
  FormModalidadesComponent,
  FormTemasComponent,
  FormTiposGraduacionComponent,
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
  TableMencionesComponent,
  TableTiposGraduacionesComponent,
  TableTiposProgramasComponent,
  TableProgramasComponent,
  TableProgramasDirectoresComponent,
  TableProgramasHistorialActividadComponent,
  TableReglamentosComponent,
  TablePlanDeEstudioComponent,
  TableSuspensionesComponent,
  TableUnidadesAcademicasComponent,
  TableJornadasComponent,
  TableModalidadesComponent,
  TableCertificacionesIntermediasPeComponent,
  TableAsignaturasPlancomunComponent,
  TableRegimenesComponent,
  FormRegimenesComponent,
  FormRangosAgComponent,
  TableRangosAgComponent,
  HistorialActividadComponent,
  TableAsignaturasComponent,
  FormAsignViewAndEditComponent,
  FormAsignUpdateComponent,
  FormPrerrequisitosComponent,
  TablePrerrequisitosComponent,
  TableParalelaSecuencialComponent,
  FormParalelaSecuencialComponent,
  TableTemasComponent,
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
