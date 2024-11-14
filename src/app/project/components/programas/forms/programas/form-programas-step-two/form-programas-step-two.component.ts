import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Campus } from 'src/app/project/models/programas/Campus';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';

@Component({
  selector: 'app-form-programas-step-two',
  templateUrl: './form-programas-step-two.component.html',
  styles: [
  ]
})
export class FormProgramasStepTwoComponent implements OnInit  {

  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    public programasService: ProgramasService
  ){}
  
  tiposProgramas: any[] = [];
  tiposProgramasGrouped: any[] = [];
  campus: any[] = [];
  instituciones: any[] = [];
  unidadesAcademicas: any[] = [];
  unidadesAcademicasGrouped: any[] = [];
  estadosMaestros: EstadoMaestro[] = [];
  showAsterisk: boolean = false;

  async ngOnInit() {
    await this.getData();
  }
  // ngOnDestroy(): void {
  //   throw new Error('Method not implemented.');
  // }

  async getData(){
    try {
      await Promise.all([
        this.getTiposProgramas(),
        this.getCampus(),
        this.getUnidadesAcademicas(),
        this.getInstituciones(),
        this.getEstadosMaestros()
      ]);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener datos del segundo paso. Intente nuevamente.',
      });
    }
  } 

  async getTiposProgramas(){
    try {
      this.tiposProgramas =  await this.programasService.getTiposProgramas();
      this.tiposProgramasGrouped = groupDataTipoPrograma(this.tiposProgramas);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener tipos de programas. Intente nuevamente.',
      });
    }
  }

  changeTipoPrograma(event: any){
    let dataSelected : TipoPrograma = this.tiposProgramas.find( tp => tp.Cod_tipoPrograma === event.value )
    this.programasService.setSelectTipoPrograma(dataSelected);
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

  changeCampus(event: any){
    let dataSelected : Campus = this.campus.find( c => c.Cod_campus === event.value )
    this.programasService.setSelectCampus(dataSelected);
  }

  async getUnidadesAcademicas(){
    try {
      this.unidadesAcademicas =  await this.programasService.getUnidadesAcademicas();
      this.unidadesAcademicasGrouped = groupDataUnidadesAcademicas(this.unidadesAcademicas);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener unidades académicas. Intente nuevamente.',
      });
    }
  }

  changeUnidadAcad(event: any){
    let dataSelected : UnidadAcademica = this.unidadesAcademicas.find( tp => tp.Cod_unidad_academica === event.value )
    this.programasService.setSelectUnidadAcademica(dataSelected);
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

  changeSwitch(event: any){
    const Instituciones = this.programasService.fbForm.get('Instituciones')!;

    switch (event.checked) {
      case true: Instituciones?.enable(); this.showAsterisk = true; break;
      case false : Instituciones?.disable(); Instituciones?.reset(); this.showAsterisk = false; break;
      default: Instituciones?.disable(); this.showAsterisk = false; break;
    }
  }


}
