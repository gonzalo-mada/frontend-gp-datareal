import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ProgramasService } from 'src/app/project/services/programas.service';
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
  campus: any[] = [];
  instituciones: any[] = [];
  unidadesAcademicas: any[] = [];

  showAsterisk: boolean = false;

  ngOnInit(): void {
    this.getTiposProgramas();
    this.getCampus();
    this.getUnidadesAcademicas();
    this.getInstituciones();
  }
  // ngOnDestroy(): void {
  //   throw new Error('Method not implemented.');
  // }

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

  changeSwitch(event: any){
    const Instituciones = this.programasService.fbForm.get('Instituciones')!;

    switch (event.checked) {
      case true: Instituciones?.enable(); this.showAsterisk = true; break;
      case false : Instituciones?.disable(); this.showAsterisk = false; break;
      default: Instituciones?.disable(); this.showAsterisk = false; break;
    }
  }


}
