import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { EstadoMaestroService } from 'src/app/project/services/programas/estado-maestro.service';
import { EstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';
import { ReglamentosService } from 'src/app/project/services/programas/reglamentos.service';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
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
  
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosAcreditacion: any[] = [];
  
  suspensiones: Suspension[] = [];
  reglamentos: Reglamento[] = [];
  showDialogDocs: boolean = false;
  showDialogEstadoAcreditacion: boolean = false;
  showSuspension : boolean = false;
  newSuspensionDialog: boolean = false;
  newReglamentoDialog: boolean = false;
  showAsterisk: boolean = false;
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
    // this.getSuspensiones();
    this.getReglamentos();
    this.subscription.add(this.programasService.buttonRefreshTableEA$.subscribe( () => {this.getEstadosAcreditacion()}))
    this.subscription.add(this.programasService.buttonRefreshTableReglamento$.subscribe( () => {this.getReglamentos()}))

    this.programasService.setModeCrud('create');
    this.programasService.resetFormPrograma();

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
    this.tableCrudService.emitResetExpandedRowsTable();
    switch (label) {
      case 'Maestro':
        this.uploaderFilesService.setContext('select','programa','agregar-programa', label)
      break;
      // case 'Título':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label)
      // break;
      // case 'Grado académico':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      // break;
      // case 'REXE':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      // break;
      // case 'Director':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      // break;
      // case 'Director alterno':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      // break;
      // case 'Estado maestro':
      //   this.uploaderFilesService.setContext('select','programa','agregar-programa', label);
      // break;
    }
    
  }

  async addNewEstadoAcreditacion(){
    try {
      this.showDialogEstadoAcreditacion = true;
      this.tableCrudService.emitResetExpandedRowsTable();
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
          key: this.programasService.keyPopups,
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
      this.tableCrudService.emitResetExpandedRowsTable();
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

  async submitNewReglamento(){
    try {
      const result: any = await new Promise((resolve: Function, reject: Function) => {
        this.reglamentosService.setModeForm('insert',null,resolve, reject);
      })
      
      if (result.success) {
        //insert exitoso
        this.getReglamentos();
        this.messageService.add({
          key: this.programasService.keyPopups,
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
      this.newReglamentoDialog = false;
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: e.detail.error.message
      });
    }
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
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
          key: this.programasService.keyPopups,
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
        
        const { files_titulo, files_gradoacad, files_director, files_directorAlterno, files_estadomaestro, files_rexe, file_maestro, ...formData } = this.programasService.fbForm.value;
        
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload
        }

        console.log("----PARAMS-----",params);
        const inserted: DataInserted = await this.programasService.insertProgramaService(params);

        if (inserted.dataWasInserted) {
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,inserted.dataInserted,'creado',true,false)
          });
          setTimeout(() => {
            this.router.navigate(['/programa/']);
          }, 2000);
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

  test(){
    Object.keys(this.programasService.fbForm.controls).forEach(key => {
      const control = this.programasService.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }


}
