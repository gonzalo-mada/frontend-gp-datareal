import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AgregarAsignaturaMainService } from 'src/app/project/services/asignaturas/asignaturas/agregar-asignatura/main.service';
import { BackendAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/backend.service';
import { FormAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/form.service';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';
import { TemasMainService } from 'src/app/project/services/asignaturas/temas/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-agregar-asignatura',
  templateUrl: './agregar-asignatura.component.html',
  styleUrls: ['./agregar-asignatura.component.css']
})
export class AgregarAsignaturaComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();
	modalidades: any[] = [];
	regimenes: any[] = [];
	tiposEvaluacion: any[] = [];
	tiposColegiadas: any[] = [];
	menciones: any[] = [];
	originalAsignaturas : any[] = [];
	asignaturas: any[] = [];
	ultima_asignatura_secuencial: any = {};
	temas: any[] = [];

	constructor(
		private backend: BackendAsignaturasService,
		public form: FormAsignaturasService,
		public main: AgregarAsignaturaMainService,
		public mainAsignatura: AsignaturasMainService,
		public mainFacultad: FacultadesMainService,
		public mainMenciones: MencionesMainService,
		public mainTemas: TemasMainService,
		private router: Router
	){}

	get contentWrapperClass() {
		return this.form.disposition ? 'col-12 lg:col-9' : 'col-12';
	}

	get sidebarClass() {
		return 'col-3';  
	}

  	async ngOnInit() {
		this.subscription.add(this.mainMenciones.onActionToBD$.subscribe(() => this.getMenciones()));
		this.subscription.add(this.mainTemas.onActionToBD$.subscribe(() => this.getTemas()));
    	await this.getData();
  	}

  	ngOnDestroy(): void {
    	this.form.resetForm();
		this.main.reset();
  	}

	async getData(){
		await Promise.all([
			this.mainFacultad.getFacultades(false),
			this.getTiposEvaluacion(),
			this.getTiposColegiadas(),
			this.getModalidades(),
			this.getRegimenes(),
		])
	}

	async getTiposEvaluacion(){
		this.tiposEvaluacion = await this.backend.getTiposEvaluacion();
	}

	async getTiposColegiadas(){
		this.tiposColegiadas = await this.backend.getTiposColegiadas();
	}

	async getModalidades(){
		this.modalidades = await this.backend.getModalidades();
	}

	async getRegimenes(){
		this.regimenes = await this.backend.getRegimenes();
	}

	async changeFacultad(event: any){
		if (this.form.stepOne) this.form.stepOne = false;
		this.main.resetArraysWhenChangedDropdownFacultad();
		this.form.resetControlsWhenChangedDropdownFacultad();
		await this.form.setSelectFacultad(event.value);
		this.main.getProgramasPorFacultad();
	}

	async changePrograma(event: any){
		this.form.resetForm(false,false);
		this.main.resetArraysWhenChangedDropdownPrograma();
		this.form.resetControlsWhenChangedDropdownPrograma();
		await this.form.setSelectPrograma(event.value);
		await Promise.all([this.getTemas(), this.main.getPlanesDeEstudiosPorPrograma()]);
		// this.form.stepOne = true;
	}

	async getTemas(){
		let params = { cod_programa: this.form.selected_CodigoPrograma };
		this.temas = await this.backend.getTemasPorPrograma(params, false);
	}

	async changePlanDeEstudio(event: any){
		this.form.resetForm(false,false);
		this.main.resetFiles();
		await this.form.setSelectPlanDeEstudio(event.value);
		await Promise.all([this.getMenciones(), this.getAsignaturas(), this.getAsignaturasSecuenciales()]);
		this.form.stepOne = true;
	}

	async getMenciones(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio };
		this.menciones = await this.backend.getMencionesPorPlanDeEstudio(params, false);
	}

	async getAsignaturas(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio };
		this.asignaturas = await this.backend.getAsignaturasSimplificatedPorPlanDeEstudio(params, false);
		console.log("this.asignaturas",this.asignaturas);
		
	}

	async getAsignaturasSecuenciales(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio };
		this.ultima_asignatura_secuencial = await this.backend.getUltimaAsignaturaSecuencialConTemaPorPlanDeEstudio(params, false);
		
	}

	changeMenciones(event: any){
		console.log("event",event);
		this.form.setSelectMencion(event.value);
		// comentado porque menciones ahora no es multiple
		// const updatedValues = event.value.map((item: any) => {
		// 	item.checkDisabled = true;
		// 	return item;
		// });
		// this.form.fbForm.get('menciones_selected')?.patchValue(updatedValues);
	}

	changePreRequisitos(event: any){
		const updatedValues = event.value.map((item: any) => {
			item.checkDisabled = true;
			return item;
		});
		this.form.fbForm.get('pre_requisitos_selected')?.patchValue(updatedValues);
	}

	changeTema(event: any){
		const updatedValues = event.value.map((item: any) => {
			item.checkDisabled = true;
			return item;
		});
		this.form.fbForm.get('tema_selected')?.patchValue(updatedValues);
	}
	
	changeRegimenes(event: any){
		this.form.setSelectRegimen(event.value);
	}

	changeTipoEvaluacion(event: any){
		this.form.setSelectTipoEvaluacion(event.value);
	}

	changeTipoColegiada(event: any){
		this.form.setSelectTipoColegiada(event.value);
	}

	changeDisposition(){
		this.form.disposition = !this.form.disposition;
	}

	stepChange(value: number){
		this.form.activeIndexStepper = value;
		this.form.activeIndexStateForm = value;
	}

	getStateClass(state: boolean): string {
		return state ? 'state-badge state-valid' : 'state-badge state-invalid';
	}
	
	getStateText(state: boolean): string {
		return state ? 'válido' : 'inválido';
	}

	changeRadioButtonMencion(event: any){
		switch (event.value) {
			case 1: 
				this.form.showMessageMencion = true;
				this.form.setStatusControlMenciones(true); 
			break;
			case 0 : 
				this.form.showMessageMencion = false; 
				this.form.setStatusControlMenciones(false); 
			break;
		}
	}

	changeRadioButtonPreRequisitos(event: any){
		switch (event.value) {
			case 1:
				if (this.asignaturas.length === 0) {
					this.form.showMessageSinAsignaturas = true;
					this.form.setStatusControlPreRequisitos(false);
				}else{
					this.form.showMessagePreRequisitos = true;
					this.form.setStatusControlPreRequisitos(true); 
				} 
			break;
			case 0 : 
				this.form.showMessagePreRequisitos = false; 
				this.form.setStatusControlPreRequisitos(false); 
			break;
		}
	}

	changeRadioButtonTema(event: any){
		switch (event.value) {
			case 1: 
				this.form.showMessageTema = true;
				this.form.setStatusControlTema(true); 
			break;
			case 0 : 
				this.form.showMessageTema = false; 
				this.form.setStatusControlTema(false); 
			break;
		}
	}

	changeRadioButtonSecuencial(event: any){
		switch (event.value) {
			case 1: 
				if (this.asignaturas.length === 0) {
					this.form.showMessageSinAsignaturas = true;
					this.form.setStatusControlSecuencialidad(false);
				}else if (this.ultima_asignatura_secuencial.length === 0){
					this.form.showMessageSinAsignaturasSecuenciales = true;
					this.form.setStatusControlSecuencialidad(false);
				}else{
					this.form.showMessageParalelidad = false;
					this.form.showMessageSecuencial = true;
					this.form.setStatusControlSecuencialidad(true); 
					this.form.setSelectSecuencialidad(this.ultima_asignatura_secuencial); 
				}  
			break;
			case 0 : 
				this.form.showMessageParalelidad = true;
				this.form.showMessageSecuencial = false;
				this.form.setStatusControlSecuencialidad(false); 
			break;
		}
	}

	setDataToPendingForm(){
		const actual_values = {...this.form.dataToPendingForm}
		this.form.dataToPendingForm = {...actual_values,show: true}
	}
	
	async initCreateFormMenciones(){
		this.setDataToPendingForm();
		await this.mainMenciones.setModeCrud('create');
	}

	async initCreateFormTemas(){
		this.setDataToPendingForm();
		await this.mainTemas.setModeCrud('create');
	}


	async redirectTo(value: 'p' | 'v' | 'c'){
		switch (value) {
		  case 'p': this.router.navigate([`/asignaturas/`]); break;
		  case 'v': this.router.navigate([`/asignaturas/show/${this.form.codAsignaturaAdded}`]); break;
		  case 'c':
			this.form.dialogSuccessAdd = false;
			this.form.confirmAdd = false;
			this.mainAsignatura.setModeCrud('create');
		  break;
		}
	}

	customFilter(event: any) {
		const query = event.filter.toLowerCase();
		console.log("filterrr",event);
		
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
		console.log("stateStepOne", this.form.stateStepOne);
		console.log("stateStepTwo", this.form.stateStepTwo);
		console.log("stateStepThree", this.form.stateStepThree);
		
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}

}
