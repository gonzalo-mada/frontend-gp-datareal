import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { LoadinggpService } from 'src/app/project/services/components/loadinggp.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
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
  styleUrls: ['./form-programas-view-and-edit.component.css']
})
export class FormProgramasViewAndEditComponent implements OnInit, OnChanges, OnDestroy {
 
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
  tiposProgramas: any[] = [];
  campus: any[] = [];
  instituciones: any[] = [];
  institucionesSelected: any[] = [];
  logsPrograma: any[] = [];
  unidadesAcademicas: any[] = [];
  estadosAcreditacion: any[] = [];
  estadosMaestros: any[] = [];
  titulo: any[] = [];
  docMaestro: any[] = [];
  grado_academico: any[] = [];
  rexe: any[] = [];
  director: any[] = [];
  directorAlterno: any[] = [];
  reglamentos: Reglamento[] = [];
  showAsterisk: boolean = false;
  modeDialog: ModeDialog;
  loading: boolean = true 
  loadingTab: boolean = true 
  private subscription: Subscription = new Subscription();
  unidadesAcademicasPrograma: any[] = [];
  tiposGraduaciones: any[] = [];
  certifIntermedias: any[] = [];
  
  async ngOnInit() {
    this.subscription.add(this.mainCertifIntermedia.onInsertedData$.subscribe(() => this.getCertificacionIntermediaPrograma()));
    this.subscription.add(this.mainTipoSuspension.onInsertedData$.subscribe(() => this.getTiposSuspensiones()));
    this.subscription.add(this.mainTipoGraduacion.onInsertedData$.subscribe(() => this.getTiposGraduaciones()));
    await this.getPrograma();
    await this.getData();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ( changes['onClickRefreshPrograma'] && changes['onClickRefreshPrograma'].currentValue) {
      console.log("change: ",changes['onClickRefreshPrograma'].currentValue);
      if (changes['onClickRefreshPrograma'].currentValue){
        await this.getPrograma();
        await this.getData();
      } 
    }
  }

  get mode(){
    return this.mainProgramas.mode;
  }
  
  async refreshPrograma(){
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
    this.programa = await this.backend.getPrograma({Cod_Programa: this.verEditarProgramaMainService.cod_programa},false,this.verEditarProgramaMainService.namesCrud);
    // console.log("DATA PROGRAMA FROM VIEW AND EDIT",this.programa);
    
    this.form.setForm(this.programa);
    this.form.fbForm.disable();
    this.form.fbForm.get('Unidades_academicas_Selected')!.enable();
    this.form.fbForm.get('Instituciones_Selected')!.enable();
    this.form.fbForm.get('Certificacion_intermedia_Selected')!.enable();
  }

  async getData(){
    try {
      await Promise.all([
        this.getCampus(),
        this.getUnidadesAcademicas(),
        // this.getInstituciones(),
        this.getInstitucionesSelected(),
        this.getReglamentos(),
        this.getEstadosAcreditacion(),
        this.getEstadosMaestros(),
        this.getDirector(),
        this.getDirectorAlterno(),
        this.getTiposProgramas(),
        this.getLogPrograma(),
        this.getUnidadesAcademicasPrograma(),
        this.getCertificacionIntermediaPrograma()
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
    this.tiposProgramas =  await this.backend.getTiposProgramas(false);
    this.tiposProgramas = groupDataTipoPrograma(this.tiposProgramas);
  }

  async getCampus(){
    this.campus =  await this.backend.getCampus(false);            
  }

  async getUnidadesAcademicas(){
    this.unidadesAcademicas =  await this.backend.getUnidadesAcademicas(false);
    this.unidadesAcademicas = groupDataUnidadesAcademicas(this.unidadesAcademicas);
  }

  async getInstituciones(){
    if (this.programa.Graduacion_Conjunta === 1) this.instituciones = await this.backend.getInstituciones(false);
  }

  async getInstitucionesSelected(){
    if (this.programa.Graduacion_Conjunta === 1) {
      this.institucionesSelected = await this.backend.getInstitucionesSelected({Cod_Programa: this.programa.Cod_Programa},false);
      this.form.fbForm.get('Instituciones_Selected')?.patchValue(this.institucionesSelected);
      await this.getTiposGraduaciones();
    }
  }

  async getTiposGraduaciones(){
    this.tiposGraduaciones =  await this.backend.getTiposGraduaciones();  
  }

  async getUnidadesAcademicasPrograma(){
    this.unidadesAcademicasPrograma = await this.backend.getUnidadesAcademicasPrograma({Cod_Programa: this.programa.Cod_Programa},false);
    this.form.fbForm.get('Unidades_academicas_Selected')?.patchValue(this.unidadesAcademicasPrograma);
  }

  async getCertificacionIntermediaPrograma(){
    if (this.programa.Certificacion_intermedia === 1) {
      this.certifIntermedias = await this.backend.getCertificacionIntermediaPrograma({Cod_Programa: this.programa.Cod_Programa},false);
      this.form.fbForm.get('Certificacion_intermedia_Selected')?.patchValue(this.certifIntermedias);
    }
  }

  async getLogPrograma(){
    this.logsPrograma = await this.backend.getLogPrograma({Cod_Programa: this.programa.Cod_Programa},false);
  }

  async getReglamentos(){
    this.reglamentos = await this.backend.getReglamentos(false);
    this.reglamentos = this.reglamentos.filter( r => r.Cod_reglamento === this.programa.Cod_Reglamento)
  }

  async getEstadosAcreditacion(){
    this.estadosAcreditacion = await this.backend.getEstadosAcreditacion(false);
    this.estadosAcreditacion = this.estadosAcreditacion.filter( ea => ea.Cod_acreditacion === this.programa.Cod_acreditacion)
  }

  async getEstadosMaestros(){
    this.estadosMaestros = await this.backend.getEstadosMaestros(false);
    this.estadosMaestros = this.estadosMaestros.filter( em => em.Cod_EstadoMaestro === this.programa.Cod_EstadoMaestro)
    if (this.programa.Cod_EstadoMaestro === 2 && this.estadosMaestros.length > 0) {
      let suspensiones = await this.backend.getSuspensiones(false);
      suspensiones = suspensiones.filter((susp: any) => susp.ID_TipoSuspension === this.programa.ID_TipoSuspension);
      if (suspensiones.length > 0) {
          this.estadosMaestros[0] = {
              ...this.estadosMaestros[0],
              ...suspensiones[0]
          };
      }
    }
  }

  getDocMaestro(){
    this.docMaestro = [];
    this.docMaestro.push({Nombre_programa: this.programa.Nombre_programa});
    this.uploaderFilesService.setLoading(false)
    
  }

  getTitulo(){
    this.titulo = [];
    this.titulo.push({Titulo: this.programa.Titulo});
  }

  getGradoAcademico(){
    this.grado_academico = [];
    this.grado_academico.push({Grado_academico: this.programa.Grado_academico});
  }

  getRexe(){
    this.rexe = [];
    this.rexe.push({Rexe: this.programa.REXE});
  }
  
  async getDirector(){
    const rut_director = this.programa.Director!.split('-');
    this.director = await this.backend.getDirector({rut: parseInt(rut_director[0])},false,'director');
  }

  async getDirectorAlterno(){
    if (this.programa.Director_alterno !== '0') {
      const rut_director_alterno = this.programa.Director_alterno!.split('-');
      this.directorAlterno = await this.backend.getDirector({rut: parseInt(rut_director_alterno[0])},false,'alterno');
    }else{
      this.directorAlterno = [];
    }
  }

  changeSwitch(event: any){
    const Instituciones = this.form.fbForm.get('Instituciones')!;
    if (this.mode === 'edit') {
      switch (event.checked) {
        case true: Instituciones?.enable(); this.showAsterisk = true; break;
        case false : Instituciones?.disable(); this.showAsterisk = false; break;
        default: Instituciones?.disable(); this.showAsterisk = false; break;
      }
    }
  }

  async changeTab(){
    this.tableCrudService.emitResetExpandedRowsTable();
  }

  async openDialog(mode: ModeDialog){
    try {
      this.modeDialog = mode;
    } catch (error) {
      console.log("error en openDialog()",error);
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al generar formulario. Intente nuevamente.',
      });
    }
  }

  resetDialog(){
    this.modeDialog = undefined;
  }

  async formUpdated(modeDialog: any){
    console.log("evenvnenv",modeDialog);
    try {
      await this.getPrograma();
      this.loading = true;
      switch (modeDialog) {
        case 'título': this.getTitulo(); break;
        case 'grado académico': this.getGradoAcademico(); break;
        case 'REXE': this.getRexe(); break;
        // case 'documentos maestros': this.createFormDocsMaestro(); break;
        case 'reglamento': await this.getReglamentos(); break;
        case 'director': await this.getDirector(); break;
        case 'director alterno': await this.getDirectorAlterno(); break;
        case 'estado maestro': await this.getEstadosMaestros(); break;
        case 'estado acreditación': await this.getEstadosAcreditacion(); break;
        default: break;
      }
      await this.getLogPrograma();
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


  updateFilesUploader(){
    this.main.updateFilesUploader();
  }

}
