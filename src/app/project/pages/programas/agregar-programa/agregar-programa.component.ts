import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { EstadoMaestro } from 'src/app/project/models/EstadoMaestro';
import { EstadosAcreditacion } from 'src/app/project/models/EstadosAcreditacion';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { Suspension } from 'src/app/project/models/Suspension';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { EstadoMaestroService } from 'src/app/project/services/estado-maestro.service';
import { EstadosAcreditacionService } from 'src/app/project/services/estados-acreditacion.service';
import { ProgramasService } from 'src/app/project/services/programas.service';
import { SuspensionesService } from 'src/app/project/services/suspensiones.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';
import { ReglamentosService } from 'src/app/project/services/reglamentos.service';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { LabelComponent } from 'src/app/project/models/shared/Context';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar-programa',
  templateUrl: './agregar-programa.component.html',
  styleUrls: ['./agregar-programa.component.css']
})
export class AgregarProgramaComponent implements OnInit, OnDestroy {
  constructor(
              public configModeService: ConfigModeService,
              private commonUtils: CommonUtils,
              public estadosAcreditacionService: EstadosAcreditacionService,
              public estadoMaestroService: EstadoMaestroService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private messageService: MessageService,
              public reglamentosService: ReglamentosService,
              private router: Router,
              public suspensionesService: SuspensionesService,
              public programasService: ProgramasService,
              private tableCrudService: TableCrudService,
              private uploaderFilesService: UploaderFilesService 
  ){}


  get containerClass() {
    return {
      'layout-static': this.programasService.disposition === true,
      'layout-overlay': this.programasService.disposition === false
    };
  }
  
  tiposProgramas: any[] = [];
  campus: any[] = [];
  unidadesAcademicas: any[] = [];
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosAcreditacion: any[] = [];
  estadosMaestros: EstadoMaestro[] = [];
  instituciones: any[] = [];
  suspensiones: Suspension[] = [];
  reglamentos: Reglamento[] = [];
  directorSelected: string = '';
  directorAlternoSelected: string = '';
  showDialogDocs: boolean = false;
  showDialogEstadoAcreditacion: boolean = false;
  showSuspension : boolean = false;
  newSuspensionDialog: boolean = false;
  newReglamentoDialog: boolean = false;
  showAsterisk: boolean = false;
  keyPopups: string = 'programa'
  estadoAcreditacion! : EstadosAcreditacion;
  estadoMaestroSelected : string = '';
  reglamentoSelected: string = '';
  showUploader: boolean = false;
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();



  ngOnInit(): void {
    this.namesCrud = {
      singular: 'programa',
      plural: 'programas',
      articulo_singular: 'el programa',
      articulo_plural: 'los programas',
      genero: 'masculino'
    };
    this.getEstadosAcreditacion();
    this.getEstadosMaestros();
    this.getSuspensiones();
    this.getReglamentos();
    this.subscription.add(this.programasService.buttonRefreshTableEA$.subscribe( () => {this.getEstadosAcreditacion()}))
    this.subscription.add(this.programasService.buttonRefreshTableReglamento$.subscribe( () => {this.getReglamentos()}))
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe( from => {
      if (from) {
        switch (from.context.component.name) {
          case 'suspension': this.downloadDocSuspension(from.file); break;
          case 'estado-acreditacion': this.downloadDocEA(from.file); break;
          case 'reglamentos': this.downloadDocReglamento(from.file); break;
          default: break;
        }
      }
      
    }))

    this.programasService.setModeCrud('create');
    // this.programasService.resetFormPrograma();

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  async getEstadosAcreditacion(){
    try {
      this.estadosAcreditacion = await this.programasService.getEstadosAcreditacion();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados de acreditación. Intente nuevamente.',
      });
    }
  }

  async getEstadosMaestros(){
    try {
      this.estadosMaestros = await this.programasService.getEstadosMaestros();
      this.estadosMaestros = this.estadosMaestros.filter( e => e.Cod_EstadoMaestro !== 2 )
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados maestros. Intente nuevamente.',
      });
    }
  }

  async getSuspensiones(){
    try {
      this.suspensiones = await this.suspensionesService.getSuspensiones();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener suspensiones. Intente nuevamente.',
      });
    }
  }

  async getReglamentos(){
    try {
      this.reglamentos = await this.programasService.getReglamentos();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener reglamentos. Intente nuevamente.',
      });
    }
  }


  async searchDirector(tipo: string){
    try {
      if (tipo === 'director') {
        const rut_director = this.programasService.fbForm.get('Director')!.value.split('-')
        this.directores = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
        
      }else{
        //tipo directoralterno
        const rut_director = this.programasService.fbForm.get('Director_alterno')!.value.split('-')
        this.directoresAlternos = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
      }


    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener el director. Intente nuevamente.',
      });
      
    }
    
  }


  chooseDocs(label: LabelComponent){

    this.showDialogDocs = true;
    switch (label) {
      case 'Título':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label)
      break;
      case 'Grado académico':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      break;
      case 'REXE':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      break;
      case 'Director':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      break;
      case 'Director alterno':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      break;
      case 'Estado maestro':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      break;
    }
    
  }

  async addNewEstadoAcreditacion(){
    try {
      this.showDialogEstadoAcreditacion = true;
      await new Promise((resolve,reject) => {
        this.estadosAcreditacionService.setModeForm('create', null, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al crear formulario de estado de acreditación.`,
        message: e.message,
        }
      );
    }

  }

  async submitNewEstadoAcreditacion(){
    try {
      const result: any = await new Promise <void> ((resolve: Function, reject: Function) => {
        this.estadosAcreditacionService.setModeForm('insert',null, resolve, reject);
      })

      if (result.success) {
        //insert exitoso
        this.getEstadosAcreditacion();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
        this.reset();
      }
      this.showDialogEstadoAcreditacion = false;
    } catch (e:any ) {
      this.showDialogEstadoAcreditacion = false;
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: 'Hubo un error al insertar un estado de acreditación. Intente nuevamente.',
      });
    }
  }

  async addNewReglamento(){
    try {
      this.newReglamentoDialog = true;
      await new Promise((resolve,reject) => {
        this.reglamentosService.setModeForm('create',null,resolve, reject);
      })
      
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al crear formulario de reglamento.`,
        message: e.message,
        }
      );
    }
    
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  onEstadoMaestroChange(event: any){
    // switch (event.value.Cod_EstadoMaestro) {
    //   case 2:
    //     this.estadoMaestroSelected = '';
    //     this.showSuspension = true;
    //     break;

    //   default: 
    //     this.estadoMaestroSelected = '';
    //     this.programasService.setSelectSuspension(undefined)
    //     this.showSuspension = false;
    //     this.estadoMaestroSelected = event.value.Descripcion_EstadoMaestro 
    //     break;
    // }
    this.programasService.setSelectEstadoMaestro(event.value as EstadoMaestro)
  }


  async addNewSuspension(){
    this.newSuspensionDialog = true;
    this.suspensionesService.setModeForm('create');
  }


  async submitNewSuspension(){
    try {
      console.log("entre aki123");
      
      const result: any = await new Promise((resolve: Function, reject: Function) => {
        this.suspensionesService.setModeForm('insert',null,resolve, reject);
      })
      console.log("resulttt",result);
      
      if (result.success) {
        //insert exitoso
        this.getSuspensiones();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
      }
      this.reset();
      this.newSuspensionDialog = false;
    } catch (e: any) {
      console.log("eeeee",e);
      
      this.newSuspensionDialog = false;
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: e.detail.error.message
      });
    }
  }

  changeSwitch(event: any){
    const Instituciones = this.programasService.fbForm.get('Instituciones');

    switch (event.checked) {
      case 'SI': Instituciones?.enable(); this.showAsterisk = true; break;
      case 'NO': Instituciones?.disable(); this.showAsterisk = false; break;
      default: Instituciones?.disable(); this.showAsterisk = false; break;
    }
  }



  async submitNewReglamento(){
    try {
      const result: any = await new Promise((resolve: Function, reject: Function) => {
        this.reglamentosService.setModeForm('insert',null,resolve, reject);
      })
      console.log("resulttt",result);
      
      if (result.success) {
        //insert exitoso
        this.getReglamentos();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
      }
      this.reset();
      this.newReglamentoDialog = false;
    } catch (e: any) {
      console.log("eeeee",e);
      
      this.newReglamentoDialog = false;
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: e.detail.error.message
      });
    }
  }

  async downloadDocSuspension(documento: any){
    try {
      let blob: Blob = await this.suspensionesService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento de tipos de suspensiones.',
          message: e.message,
      });
    }
  }

  async downloadDocReglamento(documento: any){
    try {
      let blob: Blob = await this.reglamentosService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento de reglamento.',
          message: e.message,
      });
    }
  }

  async downloadDocEA(documento: any){
    try {
      let blob: Blob = await this.estadosAcreditacionService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento de estado de acreditación.',
          message: e.message,
      });
    }
  }

  changeDisposition(){
    this.programasService.disposition = !this.programasService.disposition;
  }

  submit(){
    try {
      this.insertPrograma();
    } catch (error) {
      
    }
  }

  async insertPrograma(){
    try {
      
      let params = {};

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });
      
      if (actionUploadDoc.success) {
        
        const { files_titulo, files_gradoacad, files_director, files_directorAlterno, files_estadomaestro, files_rexe, ...formData } = this.programasService.fbForm.value;
        
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload
        }

        console.log("----PARAMS-----",params);
        const inserted: DataInserted = await this.programasService.insertProgramaService(params);

        if (inserted.dataWasInserted) {
          this.router.navigate(['/programa/']);
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,inserted.dataInserted,'creado',true,false)
          });
        }

      };
      
      
    } catch (e:any) {
      console.log("error insert programa",e);
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message,
        }
      );
      
    }finally{
      this.reset();
    }
  }

  openAccordion(){
    this.uploaderFilesService.setFiles(null);
    this.tableCrudService.emitResetExpandedRowsTable();
  }

  stepChange(value: number){
    this.programasService.activeIndexStateForm = value;
  }


}
