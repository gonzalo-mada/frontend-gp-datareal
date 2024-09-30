import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
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

@Component({
  selector: 'app-agregar-programa',
  templateUrl: './agregar-programa.component.html',
  styles: [
  ]
})
export class AgregarProgramaComponent {
  constructor(
              public configModeService: ConfigModeService,
              public estadosAcreditacionService: EstadosAcreditacionService,
              public estadoMaestroService: EstadoMaestroService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private fb: FormBuilder,
              private messageService: MessageService,
              public reglamentosService: ReglamentosService,
              public suspensionesService: SuspensionesService,
              private programasService: ProgramasService,
              private tableCrudService: TableCrudService,
              private uploaderFilesService: UploaderFilesService 
  ){}

  tiposProgramas: any[] = [];
  campus: any[] = [];
  unidadesAcademicas: any[] = [];
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosAcreditacion: any[] = [];
  estadosMaestros: any[] = [];
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
  from = {};
  keyPopups: string = 'programa'
  estadoAcreditacion! : EstadosAcreditacion;
  estadoMaestroSelected : string = '';
  reglamentoSelected: string = '';
  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Nombre_programa: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    Grupo_correo: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    Cod_programa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    Codigo_SIES: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    Codigo_FIN700: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    Tipo_programa: ['', [Validators.required]],
    Graduacion_Conjunta_Switch: [false],
    Instituciones: [{value:'', disabled: true}, [Validators.required]],
    Campus: ['', [Validators.required]],
    Estado_maestro: ['', [Validators.required]],
    Suspension: ['', [Validators.required]],
    Unidad_academica: ['', [Validators.required]],
    Titulo: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    Grado_academico: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    REXE: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    Director: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/), RutValidator.rut]],
    Director_alterno: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/), RutValidator.rut]],
  })

  ngOnInit(): void {

    this.getTiposProgramas();
    this.getCampus();
    this.getUnidadesAcademicas();
    this.getEstadosAcreditacion();
    this.getEstadosMaestros();
    this.getSuspensiones();
    this.getInstituciones();
    this.getReglamentos();
    this.subscription.add(this.programasService.actionDirectorSelected$.subscribe(actionTriggered => {actionTriggered && this.setDirectorSelected()}))
    this.subscription.add(this.programasService.actionDirectorAlternoSelected$.subscribe(actionTriggered => {actionTriggered && this.setDirectorAlternoSelected()}))
    this.subscription.add(this.programasService.buttonRefreshTableEA$.subscribe( () => {this.getEstadosAcreditacion()}))
    this.subscription.add(this.programasService.buttonRefreshTableReglamento$.subscribe( () => {this.getReglamentos()}))
    this.subscription.add(this.programasService.programaUpdate$.subscribe( programa => {
      if (programa) {
        
        if (programa.Cod_acreditacion) {
          this.estadoAcreditacion = programa.EstadosAreditacion as EstadosAcreditacion;          
        }
        if (programa.Suspension) {
          this.estadoMaestroSelected = programa.Suspension.Descripcion_TipoSuspension!;          
        }
        if (programa.Reglamento) {
          this.reglamentoSelected = programa.Reglamento.Descripcion_regla!;          
        }
      }
    }))

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
      this.campus =  await this.programasService.getCampus();            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener campus. Intente nuevamente.',
      });
    }
  }

  async getUnidadesAcademicas(){
    try {
      this.unidadesAcademicas =  await this.programasService.getUnidadesAcademicas();
      this.unidadesAcademicas = groupDataUnidadesAcademicas(this.unidadesAcademicas);
            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener unidades académicas. Intente nuevamente.',
      });
    }
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
      this.estadosMaestros = await this.estadoMaestroService.getEstadosMaestros();
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
      this.reglamentos = await this.reglamentosService.getReglamentos();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener reglamentos. Intente nuevamente.',
      });
    }
  }

  async getInstituciones(){
    try {
      this.instituciones = await this.programasService.getInstituciones();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener instituciones. Intente nuevamente.',
      });
    }
  }

  async searchDirector(tipo: string){
    try {
      if (tipo === 'director') {
        const rut_director = this.fbForm.get('Director')!.value.split('-')
        this.directores = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
        
      }else{
        //tipo directoralterno
        const rut_director = this.fbForm.get('Director_alterno')!.value.split('-')
        this.directoresAlternos = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
      }


    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener el director. Intente nuevamente.',
      });
      
    }
    
  }

  setDirectorSelected(){
    this.directorSelected = this.programasService.signalGetDirector();
  }

  setDirectorAlternoSelected(){
    this.directorAlternoSelected = this.programasService.signalGetDirectorAlterno();
  }

  chooseDocs(from: string){
    this.showDialogDocs = true;
    this.from = {
      from: 'programa',
      section: from
    };
  }

  async addNewEstadoAcreditacion(){
    this.showDialogEstadoAcreditacion = true;
    await new Promise((resolve,reject) => {
      this.estadosAcreditacionService.setModeForm('create', null, resolve, reject);
    })
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

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setFiles(null);
  }

  onEstadoMaestroChange(event: any){
    switch (event.value.Cod_EstadoMaestro) {
      case 2:
        this.estadoMaestroSelected = '';
        this.showSuspension = true;
        break;

      default: 
        this.estadoMaestroSelected = '';
        this.programasService.setSelectSuspension(undefined)
        this.showSuspension = false;
        this.estadoMaestroSelected = event.value.Descripcion_EstadoMaestro 
        break;
    }
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
    const Instituciones = this.fbForm.get('Instituciones');

    switch (event.checked) {
      case 'SI': Instituciones?.enable(); this.showAsterisk = true; break;
      case 'NO': Instituciones?.disable(); this.showAsterisk = false; break;
      default: Instituciones?.disable(); this.showAsterisk = false; break;
    }
  }

  async addNewReglamento(){
    this.newReglamentoDialog = true;
    this.reglamentosService.setModeForm('create');
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


}
