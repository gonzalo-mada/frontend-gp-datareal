import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AgregarProgramaMainService } from 'src/app/project/services/programas/programas/agregar-programa/main.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { Campus } from 'src/app/project/models/programas/Campus';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { groupDataTipoPrograma, groupDataUnidadesAcademicasWithDisabled } from 'src/app/project/tools/utils/dropwdown.utils';

@Component({
  selector: 'app-agregar-programa',
  templateUrl: './agregar-programa.component.html',
  styleUrls: ['./agregar-programa.component.css']
})
export class AgregarProgramaComponent implements OnInit, OnDestroy {
  constructor(
    public main: AgregarProgramaMainService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private backend: BackendProgramasService,
    public form: FormProgramaService,
    private messageService: MessageServiceGP,
    private router: Router,
    public mainCertifIntermedia: CertifIntermediaMainService,
    public mainTipoGraduacion: TiposGraduacionesMainService
  ){}

  get contentWrapperClass() {
    return this.main.disposition ? 'col-12 lg:col-9' : 'col-12';
  }
  
  get sidebarClass() {
    return 'col-3';  
  }

  directores: any[] = [];
  directoresAlternos: any[] = [];
  
  confirmAddPrograma: boolean = false;
  sidebarVisible2: boolean = false;

  //step 2
  tiposProgramas: any[] = [];
  tiposProgramasGrouped: any[] = [];
  campus: any[] = [];
  instituciones: any[] = [];
  unidadesAcademicas: any[] = [];
  unidadesAcademicasGrouped: any[] = [];
  estadosMaestros: EstadoMaestro[] = [];
  showAsterisk: boolean = false;
  showAsteriskCI: boolean = false;

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.form.fbForm.get('Director_selected')?.valueChanges.subscribe( (value) => {
      if (value !== '') this.main.haveDirectorAlterno()
    }));
    this.main.setModeCrud('create');
    await this.getData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async getData(){
    try {
      await Promise.all([
        this.getTiposProgramas(),
        this.getCampusActivos(),
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

  async searchDirector(tipo: string){
      if (tipo === 'director') {
        const inputRutDirector = this.form.fbForm.get('Director')!.value
        const rut_director = inputRutDirector.split('-')
        let result: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])},undefined,'director');
        if (result.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirector}.`
          });
          this.form.showTableDirectores = false;
        }else{
          this.directores = result;
          this.form.showTableDirectores = true;
        }
        
        
      }else{
        //tipo directoralterno
        const inputRutDirectorAlt = this.form.fbForm.get('Director_alterno')!.value
        const rut_director = inputRutDirectorAlt.split('-')
        let resultAlt: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])},undefined,'alterno');

        if (resultAlt.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirectorAlt}.`
          });
          this.form.showTableDirectoresAlternos = false;
        }else{
          this.directoresAlternos = resultAlt;
          this.form.showTableDirectoresAlternos = true;
        }
      }
  }

  changeDisposition(){
    this.main.disposition = !this.main.disposition;
  }

  confirmAndSubmit(){
    this.main.setModeCrud('insert');
  }

  async redirectTo(value: 'p' | 'v' | 'c'){
    switch (value) {
      case 'p': this.router.navigate([`/programa/`]); break;
      case 'v': this.router.navigate([`/programa/show/${this.form.codProgramaAdded}`]); break;
      case 'c':
        this.form.dialogSuccessAddPrograma = false;
        this.confirmAddPrograma = false;
        this.main.setModeCrud('create');
      break;
    }
  }

  stepChange(value: number){
    this.form.activeIndexStepper = value;
    this.form.activeIndexStateForm = value;
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
    console.log("VALORES FORMULARIO:",this.form.fbForm.value);
    this.form.getValuesSelected();
    this.form.getValuesIndex();
    this.form.dialogSuccessAddPrograma = true;
  }

  test2(){
    this.confirmAddPrograma = true
  }

  getStateClass(state: boolean): string {
    return state ? 'state-badge state-valid' : 'state-badge state-invalid';
  }

  getStateText(state: boolean): string {
    return state ? 'válido' : 'inválido';
  }

  //step two
  async getTiposProgramas(){
    this.tiposProgramas =  await this.backend.getTiposProgramas();
    this.tiposProgramasGrouped = groupDataTipoPrograma(this.tiposProgramas);
  }

  changeTipoPrograma(event: any){
    let dataSelected : TipoPrograma = this.tiposProgramas.find( tp => tp.Cod_tipoPrograma === event.value )
    this.form.setSelectTipoPrograma(dataSelected);
  }

  async getCampusActivos(){
    this.campus =  await this.backend.getCampusActivos();
  }

  changeCampus(event: any){
    let dataSelected : Campus = this.campus.find( c => c.codigoCampus === event.value )
    this.form.setSelectCampus(dataSelected);
  }

  async getUnidadesAcademicas(){
    this.unidadesAcademicas =  await this.backend.getUnidadesAcademicas();
    this.unidadesAcademicasGrouped = groupDataUnidadesAcademicasWithDisabled(this.unidadesAcademicas);
  }

  changeUnidadAcad(event: MultiSelectChangeEvent) {
    const updatedValues = event.value.map((item: any) => {
      item.checkDisabled = true;
      return item; 
    });
    this.form.setSelectUnidadAcademica(event.value);
    this.form.fbForm.get('Unidades_academicas_Selected')?.patchValue(updatedValues);
  }
  

  async getInstituciones(){
    this.instituciones = await this.backend.getInstituciones();
  }

  changeInstituciones(event:any){
    this.form.setSelectInstituciones(event.value);
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
    // this.tiposGraduaciones =  await this.backend.getTiposGraduaciones();
    this.mainTipoGraduacion.getTiposGraduaciones(false);
  }

  changeTipoGraduacion(event: any){
    let dataSelected : TipoGraduacion = this.mainTipoGraduacion.tipos.find( c => c.Cod_TipoColaborativa === event.value )!
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
    this.form.setSelectCertifIntermedias(event.value);
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
