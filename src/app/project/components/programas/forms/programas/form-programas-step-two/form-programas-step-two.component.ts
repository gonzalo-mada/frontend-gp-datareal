import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Campus } from 'src/app/project/models/programas/Campus';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';

@Component({
  selector: 'app-form-programas-step-two',
  templateUrl: './form-programas-step-two.component.html',
  styles: [
  ]
})
export class FormProgramasStepTwoComponent implements OnInit  {

  constructor(
    private backend: BackendProgramasService,
    private errorTemplateHandler: ErrorTemplateHandler,
    public form: FormProgramaService,
    public mainCertifIntermedia: CertifIntermediaMainService
  ){}
  
  tiposProgramas: any[] = [];
  tiposProgramasGrouped: any[] = [];
  campus: any[] = [];
  instituciones: any[] = [];
  unidadesAcademicas: any[] = [];
  unidadesAcademicasGrouped: any[] = [];
  estadosMaestros: EstadoMaestro[] = [];
  showAsterisk: boolean = false;
  showAsteriskCI: boolean = false;
  tiposGraduaciones: any[] = [];
  certifIntermedias: any[] = [];

  async ngOnInit() {
    await this.getData();
  }

  async getData(){
    try {
      await Promise.all([
        this.getTiposProgramas(),
        this.getCampus(),
        this.getUnidadesAcademicas(),
        this.getInstituciones(),
        this.getEstadosMaestros(),
        this.getTiposGraduaciones(),
        this.getCertificacionesIntermedias()
      ]);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener datos del segundo paso. Intente nuevamente.',
      });
    }
  } 

  async getTiposProgramas(){
    this.tiposProgramas =  await this.backend.getTiposProgramas();
    this.tiposProgramasGrouped = groupDataTipoPrograma(this.tiposProgramas);
  }

  changeTipoPrograma(event: any){
    let dataSelected : TipoPrograma = this.tiposProgramas.find( tp => tp.Cod_tipoPrograma === event.value )
    this.form.setSelectTipoPrograma(dataSelected);
  }

  async getCampus(){
    this.campus =  await this.backend.getCampus();
  }

  changeCampus(event: any){
    let dataSelected : Campus = this.campus.find( c => c.Cod_campus === event.value )
    this.form.setSelectCampus(dataSelected);
  }

  async getUnidadesAcademicas(){
    this.unidadesAcademicas =  await this.backend.getUnidadesAcademicas();
    this.unidadesAcademicasGrouped = groupDataUnidadesAcademicas(this.unidadesAcademicas);
  }

  changeUnidadAcad(event: any){
    this.form.fbForm.get('Unidades_academicas_Selected')?.patchValue(event.value);
  }

  async getInstituciones(){
    this.instituciones = await this.backend.getInstituciones();
  }

  changeInstituciones(event:any){
    this.form.fbForm.get('Instituciones_Selected')?.patchValue(event.value);
  }

  async getEstadosMaestros(){
    this.estadosMaestros = await this.backend.getEstadosMaestros();
    this.estadosMaestros = this.estadosMaestros.filter( e => e.Cod_EstadoMaestro !== 2 )
  }

  onEstadoMaestroChange(event: any){
    this.form.setSelectEstadoMaestro(event.value as EstadoMaestro)
  }

  async getTiposGraduaciones(){
    this.tiposGraduaciones =  await this.backend.getTiposGraduaciones();
  }

  changeTipoGraduacion(event: any){
    let dataSelected : TipoGraduacion = this.tiposGraduaciones.find( c => c.Cod_TipoColaborativa === event.value )
    this.form.setSelectTipoGraduacion(dataSelected);
  }

  changeSwitch(event: any){
    const Instituciones = this.form.fbForm.get('Instituciones')!;
    const TipoGraduacion = this.form.fbForm.get('TipoGraduacion')!;

    switch (event.checked) {
      case true: 
        Instituciones?.enable(); 
        TipoGraduacion?.enable(); 
        this.showAsterisk = true; 
      break;
      case false : 
        Instituciones?.disable(); 
        TipoGraduacion?.disable(); 
        Instituciones?.reset(); 
        TipoGraduacion?.reset(); 
        this.showAsterisk = false; 
      break;
    }
  }

  async getCertificacionesIntermedias(){
    // this.certifIntermedias =  await this.backend.getCertificacionIntermedia();
    this.mainCertifIntermedia.getCertificacionesIntermedias(false);
  }

  changeCertifIntermedias(event:any){
    this.form.fbForm.get('Certificacion_intermedia_Selected')?.patchValue(event.value);
  }

  changeSwitchCI(event: any){
    const Certificacion_intermedia = this.form.fbForm.get('Certificacion_intermedia')!;

    switch (event.checked) {
      case true: 
        Certificacion_intermedia?.enable(); 
        this.showAsteriskCI = true; 
      break;
      case false : 
        Certificacion_intermedia?.disable(); 
        Certificacion_intermedia?.reset(); 
        this.showAsteriskCI = false; 
      break;
    }
  }

}
