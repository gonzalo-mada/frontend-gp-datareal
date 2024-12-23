import { Component, OnDestroy, OnInit } from '@angular/core';
import { Programa } from 'src/app/project/models/programas/Programa';
import { AgregarPlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/agregar-plan-de-estudio/main.service';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-agregar-plan-de-estudio',
  templateUrl: './agregar-plan-de-estudio.component.html',
  styleUrls: ['./agregar-plan-de-estudio.component.css']
})
export class AgregarPlanDeEstudioComponent implements OnInit, OnDestroy {

  sidebarVisible2: boolean = false;
  showForm: boolean = false;
  showTableMenciones: boolean = false;
  estadosPlanEstudio: any[] = [];
  modalidades: any[] = [];
  jornadas: any[] = [];
  regimenes: any[] = [];
  programa_postgrado: Programa = {};
  showAsteriskCI: boolean = false;

  constructor(
    private backend: BackendPlanesDeEstudiosService,
    public main: AgregarPlanDeEstudioMainService,
    public form: FormPlanDeEstudioService,
    public mainFacultad: FacultadesMainService,
    public mainCertifIntermedia: CertifIntermediaMainService
  ){}


  get contentWrapperClass() {
    return this.main.disposition ? 'col-12 lg:col-9' : 'col-12';
  }

  get sidebarClass() {
    return 'col-3';  
  }

  async ngOnInit() {
    await this.getData();
  }

  ngOnDestroy(): void {
    this.form.resetForm();
    this.main.reset();
  }

  async getData(){
    await Promise.all([
      this.mainFacultad.getFacultades(false),
      this.getEstadosPlanEstudio(),
      this.getModalidades(),
      this.getJornadas(),
      this.getRegimenes()
    ]);
  }

  async getEstadosPlanEstudio(){
    this.estadosPlanEstudio = await this.backend.getEstadosPlanEstudio();
  }

  async getModalidades(){
    this.modalidades = await this.backend.getModalidades();
  }
  
  async getJornadas(){
    this.jornadas = await this.backend.getJornadas();
  }

  async getRegimenes(){
    this.regimenes = await this.backend.getRegimenes();
  }

  changeEstadoPlanEstudio(event: any){
    this.form.setSelectEstadoPlanEstudio(event);
  }

  changeModalidad(event: any){
    this.form.setSelectModalidad(event);
  }

  changeJornadas(event: any){
    this.form.setSelectJornada(event);
  }

  changeRegimenes(event: any){
    this.form.setSelectRegimen(event);
  }


  changeDisposition(){
    this.main.disposition = !this.main.disposition;
  }

  getStateClass(state: boolean): string {
    return state ? 'state-badge state-valid' : 'state-badge state-invalid';
  }

  getStateText(state: boolean): string {
    return state ? 'válido' : 'inválido';
  }

  stepChange(value: number){
    this.form.activeIndexStepper = value;
    this.form.activeIndexStateForm = value;
  }

  changeFacultad(event: any){
    this.main.cod_facultad_selected = event.value;
    this.main.getProgramasPorFacultad();
    if (this.showForm) this.showForm = false;
  }

  async changePrograma(event: any){
    let params = { Cod_Programa: event.value }
    this.programa_postgrado = await this.backend.getProgramaPostgrado(params, false);
    this.mainCertifIntermedia.getCertificacionIntermediaPrograma(event.value,false);
    console.log("this.programa_postgrado",this.programa_postgrado);
    this.form.resetForm(false);
    this.form.cod_programa_selected = event.value;
    this.form.fbForm.patchValue({ Cod_Programa: event.value });
    this.showForm = true;
  }

  changeCertifIntermedias(event:any){
    this.form.fbForm.get('Certificaciones_Intermedias')?.patchValue(event.value);
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
    console.log("VALORES FORMULARIO:",this.form.fbForm.value);
    // this.form.getValuesSelected();
    // this.form.getValuesIndex();
  }

  changeSwitchCI(event: any){
    const Certificacion_intermedia = this.form.fbForm.get('Certificaciones_Intermedias')!;

    switch (event.checked) {
      case true:
        this.programa_postgrado.Certificacion_intermedia === 0 ? this.form.showMessageCI = true :  this.form.showMessageCI = false
        Certificacion_intermedia?.enable(); 
        this.showAsteriskCI = true; 
      break;
      case false : 
        Certificacion_intermedia?.disable(); 
        Certificacion_intermedia?.reset(); 
        this.showAsteriskCI = false; 
        this.form.showMessageCI = false;
      break;
    }
  }

  changeSwitchArticulaciones(event: any){
    switch (event.checked) {
      case true: this.form.showMessageArticulacion = true; break;
      case false : this.form.showMessageArticulacion = false; break;
    }
  }

  changeSwitchPlanComun(event: any){
    switch (event.checked) {
      case true: this.form.showMessagePlanComun = true; break;
      case false : this.form.showMessagePlanComun = false; break;
    }
  }

  changeSwitchMenciones(event: any){
    switch (event.checked) {
      case true: this.showTableMenciones = true; break;
      case false : this.showTableMenciones = false; break;
    }
  }

}
