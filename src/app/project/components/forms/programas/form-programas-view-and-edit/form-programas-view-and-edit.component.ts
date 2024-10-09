import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Programa } from 'src/app/project/models/Programa';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramasService } from 'src/app/project/services/programas.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';

@Component({
  selector: 'app-form-programas-view-and-edit',
  templateUrl: './form-programas-view-and-edit.component.html',
  styles: [
  ]
})
export class FormProgramasViewAndEditComponent implements OnInit, OnChanges, OnDestroy {
 
  constructor(
    public configModeService: ConfigModeService,
    private errorTemplateHandler: ErrorTemplateHandler,
    public programasService: ProgramasService,
    public tableCrudService: TableCrudService
  ){}

  @Input() mode: string = '';
  @Input() data: Programa = {};

  tiposProgramas: any[] = [];
  campus: any[] = [];
  instituciones: any[] = [];
  institucionesSelected: any[] = [];
  unidadesAcademicas: any[] = [];
  estadosAcreditacion: any[] = [];
  estadosMaestros: any[] = [];
  titulo: any[] = [];
  grado_academico: any[] = [];
  rexe: any[] = [];
  director: any[] = [];
  directorAlterno: any[] = [];
  reglamentos: Reglamento[] = [];
  showAsterisk: boolean = false;

  async ngOnInit() {
    console.log("ESTAMOS EN MODO:",this.mode);
    this.programasService.setFormPrograma(this.data);
    console.log("DATA: ",this.data);
    this.programasService.fbForm.disable();
    await this.getData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngOnDestroy(): void {
    
  }

  getData(){
    this.getTiposProgramas();
    this.getCampus();
    this.getUnidadesAcademicas();
    this.getInstituciones();
    this.getInstitucionesSelected();
    this.getReglamentos();
    this.getEstadosAcreditacion();
    this.getEstadosMaestros();
    this.getTitulo();
    this.getGradoAcademico();
    this.getRexe();
    this.getDirector();
    this.getDirectorAlterno();
  }

  async getTiposProgramas(){
    try {
      this.tiposProgramas =  await this.programasService.getTiposProgramas();
      this.tiposProgramas = groupDataTipoPrograma(this.tiposProgramas);
      console.log("asi viene",this.tiposProgramas);
      
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

  async getInstitucionesSelected(){
    try {
      this.institucionesSelected = await this.programasService.getInstitucionesSelected({Cod_Programa: this.data.Cod_Programa});
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener instituciones seleccionadas. Intente nuevamente.',
      });
    }
  }

  async getReglamentos(){
    try {
      this.reglamentos = await this.programasService.getReglamentos();
      if (this.mode === 'show') {
        this.reglamentos = this.reglamentos.filter( r => r.Cod_reglamento === this.data.Cod_Reglamento)
      }
            
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener reglamentos. Intente nuevamente.',
      });
    }
  }

  async getEstadosAcreditacion(){
    try {
      this.estadosAcreditacion = await this.programasService.getEstadosAcreditacion();
      if (this.mode === 'show') {
        this.estadosAcreditacion = this.estadosAcreditacion.filter( ea => ea.Cod_acreditacion === this.data.Cod_acreditacion)
      }
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
      this.estadosMaestros = this.estadosMaestros.filter( em => em.Cod_EstadoMaestro === this.data.Cod_EstadoMaestro)
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados maestros. Intente nuevamente.',
      });
    }
  }

  getTitulo(){
    try {
      this.titulo.push({Titulo: this.data.Titulo}) ;
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener título. Intente nuevamente.',
      });
    }
  }

  getGradoAcademico(){
    try {
      this.grado_academico.push({Grado_academico: this.data.Grado_academico}) ;
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener grado académico. Intente nuevamente.',
      });
    }
  }

  getRexe(){
    try {
      this.rexe.push({Rexe: this.data.REXE}) ;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener REXE. Intente nuevamente.',
      });
    }
  }
  
  async getDirector(){
    try {
      const rut_director = this.data.Director!.split('-');
      this.director = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener director. Intente nuevamente.',
      });
    }
  }

  async getDirectorAlterno(){
    try {
      const rut_director = this.data.Director_alterno!.split('-');
      this.directorAlterno = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
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

  changeTab(){
    this.tableCrudService.emitResetExpandedRowsTable();
  }

}
