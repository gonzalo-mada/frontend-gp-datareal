import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SelectItemGroup } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Campus } from 'src/app/project/models/programas/Campus';
import { ModeDialog, Programa, UpdatePrograma } from 'src/app/project/models/programas/Programa';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { LoadinggpService } from 'src/app/project/services/components/loadinggp.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { ProgramaMainService } from 'src/app/project/services/programas/programas/main.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas, groupDataUnidadesAcademicasWithDisabled } from 'src/app/project/tools/utils/dropwdown.utils';

@Component({
  selector: 'app-form-programas-view-and-edit',
  templateUrl: './form-programas-view-and-edit.component.html',
  styleUrls: []
})
export class FormProgramasViewAndEditComponent implements OnInit, OnDestroy {
 
  constructor(
    private backend: BackendProgramasService,
    private errorTemplateHandler: ErrorTemplateHandler,
    public form: FormProgramaService,
    private systemService: LoadinggpService,
    public tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService,
    public main: VerEditarProgramaMainService,
    private mainProgramas: ProgramaMainService,
    public mainTipoSuspension: TiposSuspensionesMainService,
    public mainTipoGraduacion: TiposGraduacionesMainService,
    public mainCertifIntermedia: CertifIntermediaMainService
  ){}

  @Output() modeDialogEmitter = new EventEmitter();

  programa: Programa = {};
  logsPrograma: any[] = [];
  updatePrograma!: UpdatePrograma | undefined;
  loading: boolean = true 
  onClickRefreshPrograma: boolean = false;
  private subscription: Subscription = new Subscription();
  
  async ngOnInit() {
    this.subscription.add(this.mainCertifIntermedia.onInsertedData$.subscribe(() => this.getCertificacionIntermediaPrograma()));
    this.subscription.add(this.mainTipoSuspension.onInsertedData$.subscribe(() => this.getTiposSuspensiones()));
    this.subscription.add(this.mainTipoGraduacion.onInsertedData$.subscribe(() => this.getTiposGraduaciones()));
    this.main.setOrigen('programa','programa_s',this.mainProgramas.cod_programa);
    await this.getPrograma();
    await this.getData();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
  }

  get mode(){
    return this.mainProgramas.mode;
  }
  
  async refreshPrograma(){
    await this.main.refreshHistorialActividad();
    await this.getPrograma();
    await this.getData();
    this.onClickRefreshPrograma = true;
    setTimeout(() => {
      this.onClickRefreshPrograma = false
    }, 500); 
  }

  async getPrograma(){
    this.systemService.loading(true);
    this.loading = true;
    this.programa = await this.backend.getPrograma({Cod_Programa: this.main.cod_programa},false,this.main.namesCrud);
    this.main.programa = {...this.programa};
    console.log("DATA PROGRAMA FROM VIEW AND EDIT",this.programa);
    this.form.resetForm();
    this.form.setForm(this.programa);
    this.form.fbForm.disable();
    this.form.fbForm.get('Unidades_academicas_Selected')!.enable();
    this.form.fbForm.get('Instituciones_Selected')!.enable();
    this.form.fbForm.get('Certificacion_intermedia_Selected')!.enable();
  }

  async getData(){
    try {
      await Promise.all([
        this.getCampusActivos(),
        this.getInstitucionesSelected(),
        this.getTiposProgramas(),
        this.getLogPrograma(),
        this.getUnidadesAcademicas(),
        this.getUnidadesAcademicasPrograma(),
        this.getCertificacionIntermediaPrograma(),
        this.getTiposGraduaciones(),
        this.getEstadosMaestros(),
        this.getTiposSuspensiones(),
      ]);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener el programa. Intente nuevamente.',
      });
    }finally{
      this.systemService.loading(false);
      this.loading = false;
    }
  }

  async getTiposProgramas(){
    this.main.tiposProgramas  =  await this.backend.getTiposProgramas(false);
    this.main.tiposProgramasGrouped = groupDataTipoPrograma(this.main.tiposProgramas);
    let tipoProgramaSelected = this.main.tiposProgramas.find( tp => tp.Cod_tipoPrograma === this.programa.Tipo_programa);
    this.form.setSelectTipoPrograma(tipoProgramaSelected as TipoPrograma)
  }

  async getEstadosMaestros(){
    this.main.estadosMaestros = await this.backend.getEstadosMaestros(false);
  }

  async getTiposSuspensiones(){
    this.main.suspensiones = await this.backend.getSuspensiones(false);
  }

  async getCampusActivos(){
    this.main.campus = await this.backend.getCampusActivos(false);
    let campusSelected = this.main.campus.find( c => c.codigoCampus === this.programa.Campus);
    this.form.setSelectCampus(campusSelected as Campus)           
  }

  async getInstitucionesSelected(){
    this.main.instituciones = await this.backend.getInstituciones(false);
    if (this.programa.Graduacion_Conjunta === 1) {
      this.main.institucionesSelected = await this.backend.getInstitucionesSelected({Cod_Programa: this.programa.Cod_Programa},false);
      this.form.fbForm.get('Instituciones_Selected')?.patchValue(this.main.institucionesSelected);
      await this.getTiposGraduaciones();
    }else{
      this.form.fbForm.get('Instituciones_Selected')?.patchValue('');
      this.form.unsetSelectTipoGraduacion();
    }
  }

  async getTiposGraduaciones(){
    this.main.tiposGraduaciones =  await this.backend.getTiposGraduaciones(false);
    if (this.programa.Cod_TipoGraduacion !== null) {
      let tipoGraduacionSelected = this.main.tiposGraduaciones.find( tg => tg.Cod_TipoColaborativa === this.programa.Cod_TipoGraduacion);
      this.form.setSelectTipoGraduacion(tipoGraduacionSelected as TipoGraduacion)   
    }
  }

  async getUnidadesAcademicas(){
    this.main.unidadesAcademicas =  await this.backend.getUnidadesAcademicas();
    this.main.unidadesAcademicasGrouped = groupDataUnidadesAcademicas(this.main.unidadesAcademicas);
  }

  async getUnidadesAcademicasPrograma(){
    this.main.unidadesAcademicasPrograma = await this.backend.getUnidadesAcademicasPrograma({Cod_Programa: this.programa.Cod_Programa},false);
    this.form.fbForm.get('Unidades_academicas_Selected')?.patchValue(this.main.unidadesAcademicasPrograma);
    this.main.unidadesAcademicasPrograma = groupDataUnidadesAcademicasWithDisabled(this.main.unidadesAcademicasPrograma);
  }

  async getCertificacionIntermediaPrograma(){
    this.main.certificaciones =  await this.backend.getCertificacionIntermedia(false);
    if (this.programa.Certificacion_intermedia === 1) {
      this.main.certificacionesPrograma = await this.backend.getCertificacionIntermediaPrograma({Cod_Programa: this.programa.Cod_Programa},false);
      this.form.fbForm.get('Certificacion_intermedia_Selected')?.patchValue(this.main.certificacionesPrograma);
    }
  }

  async getLogPrograma(){
    this.logsPrograma = await this.backend.getLogPrograma({Cod_Programa: this.programa.Cod_Programa},false);
  }

  async changeTab(){
    this.tableCrudService.emitResetExpandedRowsTable();
  }

  async openDialog(modeDialog: ModeDialog, collection: CollectionsMongo, isEditableWithPE: boolean){
    try {
      this.updatePrograma = {modeDialog , collection, isEditableWithPE};
    } catch (error) {
      console.log("error en openDialog()",error);
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al generar formulario. Intente nuevamente.',
      });
    }
  }

  resetDialog(){
    this.updatePrograma = undefined;
  }

  async formUpdated(modeDialog: ModeDialog){
    try {
      await this.getPrograma();
      await this.main.refreshHistorialActividad();
      this.loading = true;
      // switch (modeDialog) {
      //   case 'unidades académicas': await this.getUnidadesAcademicasPrograma(); break;
      //   case 'tipo de programa': await this.getTiposProgramas(); break;
      //   case 'campus': await this.getCampus(); break;
      //   case 'graduación colaborativa': await this.getInstitucionesSelected(); break;
      //   case 'certificación intermedia': await this.getCertificacionIntermediaPrograma(); break;
      // }
      await this.getData();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener registros tras actualización. Intente nuevamente.',
      });
    }finally{
      this.systemService.loading(false);
      this.loading = false;
    }
  }

  test(){
    console.log("fbFormUpdate",this.form.fbFormUpdate.value);
    console.log("stateFormUpdate programaService: ",this.form.stateFormUpdate);
    
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbFormUpdate.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  getDynamicPrincipalValue(input: any): any {
    if (input.control) {
      return this.form.fbForm.get(input.control)?.value; 
    }
    if (input.principalValue) {
      return this.resolveValue(input.principalValue); 
    }
    if (input.secondaryValue) {
      return this.resolveValue(input.secondaryValue); 
    }
    return null; // Si no hay control ni inputValue
  }

  getDynamicSecondaryValue(input: any): any {
    if (input.secondaryValue) {
      return this.resolveValue(input.secondaryValue); 
    }
    return null; // Si no hay control ni inputValue
  }
  
  private resolveValue(value: string): any {
    return value.split('.').reduce((acc: any, key: any) => acc?.[key], this); // Resolver valor dinámico como 'form.inputEstadoAcreditacion'
  }

  getToolTip(isEditable: boolean): string {
    let message = '';
    if (isEditable) {
      this.mode === 'show' ? message = 'Ver mas detalles' : message = 'Editar registro'
      return message
    }else{
      this.mode === 'show' ? message = 'No cuenta con mas detalles' : message = 'No es posible editar'
      return message
    }
  }



}
