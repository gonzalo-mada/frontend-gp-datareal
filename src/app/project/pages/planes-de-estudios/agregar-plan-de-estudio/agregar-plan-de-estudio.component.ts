import { Component, OnDestroy, OnInit } from '@angular/core';
import { Programa } from 'src/app/project/models/programas/Programa';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { AsignaturasPlancomunMainService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/main.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { AgregarPlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/agregar-plan-de-estudio/main.service';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-agregar-plan-de-estudio',
  templateUrl: './agregar-plan-de-estudio.component.html',
  styleUrls: ['./agregar-plan-de-estudio.component.css']
})
export class AgregarPlanDeEstudioComponent implements OnInit, OnDestroy {


	estadosPlanEstudio: any[] = [];
	modalidades: any[] = [];
	jornadas: any[] = [];
	regimenes: any[] = [];
	programa_postgrado: Programa = {};

	constructor(
		private backend: BackendPlanesDeEstudiosService,
		public main: AgregarPlanDeEstudioMainService,
		public form: FormPlanDeEstudioService,
		public mainFacultad: FacultadesMainService,
		private mainArticulacion: ArticulacionesMainService,
		private mainAsigPlanComun: AsignaturasPlancomunMainService,
		private mainCertifIntPe: CertifIntermediasPEMainService
	){}

	get contentWrapperClass() {
		return this.form.disposition ? 'col-12 lg:col-9' : 'col-12';
	}

	get sidebarClass() {
		return 'col-3';  
	}

	async ngOnInit() {
		await this.getData();
	}

	ngOnDestroy(): void {
		console.log("me destrui agregar plan de estudio.");
		
		this.form.resetForm();
		this.main.reset();
	}

	async getData(){
		await Promise.all([
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

	changeFacultad(event: any){
		if (this.form.stepOne) this.form.stepOne = false;
		this.form.setSelectFacultad(event.value);
		this.main.getProgramasPorFacultad();
	}

	async changePrograma(event: any){
		console.log("event",event);
		
		this.form.resetForm(false);
		await this.form.setSelectPrograma(event.value);
		let params = { Cod_Programa: this.form.selected_CodigoPrograma }
		console.log("params",params);
		
		this.programa_postgrado = await this.backend.getProgramaPostgrado(params, false);
		this.form.checkCertifIntermedia(this.programa_postgrado);
		this.form.stepOne = true;
	}

	changeEstadoPlanEstudio(event: any){
		this.form.setSelectEstadoPlanEstudio(event.value);
	}

	changeModalidad(event: any){
		this.form.setSelectModalidad(event.value);
	}

	changeJornadas(event: any){
		this.form.setSelectJornada(event.value);
	}

	changeRegimenes(event: any){
		this.form.setSelectRegimen(event.value);
	}

	changeDisposition(){
		this.form.disposition = !this.form.disposition;
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


	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		const control = this.form.fbForm.get(key);
		if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		}
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
		this.form.showCardForm = false;
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}
	

	changeRadioButtonCI(event: any){
		switch (event.value) {
		case 1: this.form.showMessageCI = true; break;
		case 0 : this.form.showMessageCI = false; break;
		}
	}

	changeRadioButtonArticulaciones(event: any){
		switch (event.value) {
		case 1: this.form.showMessageArticulacion = true; break;
		case 0 : this.form.showMessageArticulacion = false; break;
		}
	}

	changeRadioButtonPlanComun(event: any){
		switch (event.value) {
		case 1: this.form.showMessagePlanComun = true; break;
		case 0 : this.form.showMessagePlanComun = false; break;
		}
	}

	changeRadioButtonRangos(event: any){
		switch (event.value) {
		case 1: this.form.showMessageRangos = true; break;
		case 0 : this.form.showMessageRangos = false; break;
		}
	}

	changeRadioButtonMencion(event: any){
		switch (event.value) {
		case 1: this.form.showMessageMenciones = true; break;
		case 0 : this.form.showMessageMenciones = false; break;
		}
	}

	onShowClick(pendingForm: any){
		console.log("pendingForm",pendingForm);
		switch (pendingForm) {
		case 'tiene_articulacion':
			this.resetDataToPendingForm();
			this.form.showTableArticulaciones = true
		break;
		
		default:
			break;
		}
		
	}

	async onCreateClick(pendingForm: any){
		console.log("pendingForm",pendingForm);
		switch (pendingForm) {
		case 'tiene_articulacion': this.initCreateFormArticulacion(); break;
		case 'tiene_plan_comun':
			this.form.showFormAsignPlanComun = true
			await this.mainAsigPlanComun.setModeCrud('create');
		break;

		case 'tiene_certificacion':
			this.form.showFormCertif = true
			await this.mainCertifIntPe.setModeCrud('create');
		break;
		
		default:
			break;
		}
		
	}

	setDataToPendingForm(){
		const actual_values = {...this.form.dataExternal}
		this.form.dataExternal = {...actual_values,show: true}
	}

	resetDataToPendingForm(){
		const actual_values = {...this.form.dataExternal}
		this.form.dataExternal = {...actual_values,show: false}
	}

	async initCreateFormArticulacion(){
		this.setDataToPendingForm();
		await this.mainArticulacion.setModeCrud('create');
	}


}
