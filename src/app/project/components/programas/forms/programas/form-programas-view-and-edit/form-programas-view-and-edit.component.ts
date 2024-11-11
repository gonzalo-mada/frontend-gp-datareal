import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { LoadinggpService } from 'src/app/project/services/components/loadinggp.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';



@Component({
  selector: 'app-form-programas-view-and-edit',
  templateUrl: './form-programas-view-and-edit.component.html',
  styleUrls: ['./form-programas-view-and-edit.component.css']
})
export class FormProgramasViewAndEditComponent implements OnInit, OnDestroy {
 
  constructor(
    private commonUtils: CommonUtils,
    public configModeService: ConfigModeService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    public programasService: ProgramasService,
    private systemService: LoadinggpService,
    public tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  @Input() mode: string = '';
  @Input() cod_programa: any;
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
  keyPopups: string = 'editar-programa';
  
  async ngOnInit() {
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.label) {
          switch (from.context.component.label) {
            case 'Maestro': this.downloadDoc(from.file,'maestro'); break;
            case 'Director': this.downloadDoc(from.file,'director'); break;
            case 'Director alterno': this.downloadDoc(from.file,'directorAlterno'); break;
            case 'Estado maestro': this.downloadDoc(from.file,'estado_maestro'); break;
            case 'Grado académico': this.downloadDoc(from.file,'grado_academico'); break;
            case 'REXE': this.downloadDoc(from.file,'REXE'); break;
            case 'Título': this.downloadDoc(from.file,'titulo'); break;
          }
        }else{
          switch (from.context.component.name) {
            case 'reglamentos': this.downloadDoc(from.file,'reglamentos'); break;
            case 'estado-acreditacion': this.downloadDoc(from.file,'estados_acreditacion'); break;
          }
        }
      }
    }));
    await this.getPrograma();
    await this.getData();
  }
  

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  async getPrograma(){
    try {
      this.systemService.loading(true);
      this.loading = true;
      this.programa = await this.programasService.getPrograma({Cod_Programa: this.cod_programa},false);
      console.log("DATA PROGRAMA",this.programa);
      
      this.programasService.setFormPrograma(this.programa);
      this.programasService.fbForm.disable();

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener el programa. Intente nuevamente.',
      });
    }
  }

  async getData(){
    try {
      await Promise.all([
        this.getCampus(),
        this.getUnidadesAcademicas(),
        this.getInstituciones(),
        this.getInstitucionesSelected(),
        this.getReglamentos(),
        this.getEstadosAcreditacion(),
        this.getEstadosMaestros(),
        this.getDirector(),
        this.getDirectorAlterno(),
        this.getTiposProgramas(),
        this.getLogPrograma()
      ]);
      // Llamadas sincrónicas o que no necesitan espera
      this.getTitulo();
      this.getGradoAcademico();
      this.getRexe();
      this.getDocMaestro();
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
    try {
      this.tiposProgramas =  await this.programasService.getTiposProgramas();
      this.tiposProgramas = groupDataTipoPrograma(this.tiposProgramas);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener tipos de programas. Intente nuevamente.',
      });
    }
  }

  async getCampus(){
    try {
      this.campus =  await this.programasService.getCampus(false);            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener campus. Intente nuevamente.',
      });
    }
  }

  async getUnidadesAcademicas(){
    try {
      this.unidadesAcademicas =  await this.programasService.getUnidadesAcademicas(false);
      this.unidadesAcademicas = groupDataUnidadesAcademicas(this.unidadesAcademicas);
            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener unidades académicas. Intente nuevamente.',
      });
    }
  }

  async getInstituciones(){
    try {
      this.instituciones = await this.programasService.getInstituciones(false);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener instituciones. Intente nuevamente.',
      });
    }
  }

  async getInstitucionesSelected(){
    try {
      this.institucionesSelected = await this.programasService.getInstitucionesSelected({Cod_Programa: this.programa.Cod_Programa},false);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener instituciones seleccionadas. Intente nuevamente.',
      });
    }
  }

  async getLogPrograma(){
    try {
      this.logsPrograma = await this.programasService.getLogPrograma({Cod_Programa: this.programa.Cod_Programa},false);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener historial de actividades. Intente nuevamente.',
      });
    }
  }

  async getReglamentos(){
    try {
      this.reglamentos = await this.programasService.getReglamentos(false);
      this.reglamentos = this.reglamentos.filter( r => r.Cod_reglamento === this.programa.Cod_Reglamento)
            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener reglamentos. Intente nuevamente.',
      });
    }
  }

  async getEstadosAcreditacion(){
    try {
      this.estadosAcreditacion = await this.programasService.getEstadosAcreditacion(false);
      this.estadosAcreditacion = this.estadosAcreditacion.filter( ea => ea.Cod_acreditacion === this.programa.Cod_acreditacion)

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados de acreditación. Intente nuevamente.',
      });
    }
  }

  async getEstadosMaestros(){
    try {
      this.estadosMaestros = await this.programasService.getEstadosMaestros(false);
      this.estadosMaestros = this.estadosMaestros.filter( em => em.Cod_EstadoMaestro === this.programa.Cod_EstadoMaestro)
      if (this.programa.Cod_EstadoMaestro === 2 && this.estadosMaestros.length > 0) {
        let suspensiones = await this.programasService.getSuspensiones(false);
        suspensiones = suspensiones.filter((susp: any) => susp.ID_TipoSuspension === this.programa.ID_TipoSuspension);
        if (suspensiones.length > 0) {
            this.estadosMaestros[0] = {
                ...this.estadosMaestros[0],
                ...suspensiones[0]
            };
        }
    }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados maestros. Intente nuevamente.',
      });
    }
  }

  getDocMaestro(){
    try {
      this.docMaestro = [];
      this.docMaestro.push({Nombre_programa: this.programa.Nombre_programa}) ;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener documento maestro. Intente nuevamente.',
      });
    }finally{
      this.uploaderFilesService.setLoading(false)
    }
  }

  getTitulo(){
    try {
      this.titulo = [];
      this.titulo.push({Titulo: this.programa.Titulo}) ;
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener título. Intente nuevamente.',
      });
    }
  }

  getGradoAcademico(){
    try {
      this.grado_academico = [];
      this.grado_academico.push({Grado_academico: this.programa.Grado_academico}) ;
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener grado académico. Intente nuevamente.',
      });
    }
  }

  getRexe(){
    try {
      this.rexe = [];
      this.rexe.push({Rexe: this.programa.REXE}) ;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener REXE. Intente nuevamente.',
      });
    }
  }
  
  async getDirector(){
    try {
      const rut_director = this.programa.Director!.split('-');
      this.director = await this.programasService.getDirector({rut: parseInt(rut_director[0])},false);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener director. Intente nuevamente.',
      });
    }
  }

  async getDirectorAlterno(){
    try {
      if (this.programa.Director_alterno !== '0') {
        const rut_director_alterno = this.programa.Director_alterno!.split('-');
        this.directorAlterno = await this.programasService.getDirector({rut: parseInt(rut_director_alterno[0])},false);
      }else{
        this.directorAlterno = [];
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener director alterno. Intente nuevamente.',
      });
    }
  }

  changeSwitch(event: any){
    const Instituciones = this.programasService.fbForm.get('Instituciones')!;
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

  async downloadDoc(documento: any, from: string) {
    try {
      let blob: Blob = await this.programasService.getArchiveDoc(documento.id, from);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.detail.error.message.message
      });
    }
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
}
