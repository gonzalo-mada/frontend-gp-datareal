import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
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
	originalAsignaturas_semestre : any[] = [];
	asignaturas_semestre : any[] = [];
	asignaturas: any[] = [];
	temas: any[] = [];
	expandedRows = {};

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
		this.main.reset();
  	}

	async getData(){
		await Promise.all([
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
		await Promise.all([this.getMenciones(), this.getAsignaturas()]);
		this.form.stepOne = true;
	}

	async getMenciones(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio };
		this.menciones = await this.backend.getMencionesPorPlanDeEstudio(params, false);
	}

	async getAsignaturas(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio };
		this.asignaturas = await this.backend.getAsignaturasSimplificatedConTemaAgrupado(params, false);
	}

	async getAsignaturasConTemaAgrupadoPorSemestre(){
		let params = { cod_plan_estudio: this.form.selected_CodigoPlanDeEstudio , semestre: this.form.fbForm.get('semestre')?.value };
		this.originalAsignaturas_semestre = await this.backend.getAsignaturasConTemaAgrupadoPorSemestre(params, false);
	}

	changeMenciones(event: any){
		this.form.setSelectMencion(event.value);
		// comentado porque menciones ahora no es multiple
		// const updatedValues = event.value.map((item: any) => {
		// 	item.checkDisabled = true;
		// 	return item;
		// });
		// this.form.fbForm.get('menciones_selected')?.patchValue(updatedValues);
	}

	changeTema(event: any){
		const updatedValues = event.value.map((item: any) => {
			item.checkDisabled = true;
			return item;
		});
		this.form.setSelectControlTemas(updatedValues)
	}
	
	changeRegimenes(event: any){
		this.form.setSelectRegimen(event.value);
	}

	changeModalidad(event: any){
		this.form.setSelectModalidad(event.value);
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

	async changeRadioButtonSecuencial(event: any){
		if (this.originalAsignaturas_semestre.length === 0) {
			this.form.showMessageSinAsignaturas = true;
			this.form.setStatusControlSecuencialidad(false);
			this.form.setStatusControlParalelidad(false);
		}else{
			this.asignaturas_semestre = [...this.originalAsignaturas_semestre]
			switch (event.value) {
				case 1:
					//secuencial
					this.asignaturas_semestre = this.asignaturas_semestre.filter((asign: any) => asign.data.tiene_secuencialidad === 1);
					if (this.asignaturas_semestre.length === 0) {
						this.form.showMessageSinAsignaturasSecuencialesParalelas = true;
						this.form.showMessageSecuencialParalela = false;
						this.form.setStatusControlSecuencialidad(false);
					}else{
						this.form.showMessageSinAsignaturasSecuencialesParalelas = false;
						this.form.showMessageSecuencialParalela = true;
						this.form.setStatusControlSecuencialidad(true);
						this.form.setStatusControlParalelidad(false);
					}
					
				break;
				case 0 : 
					//paralela
					this.asignaturas_semestre = this.asignaturas_semestre.filter((asign: any) => asign.data.tiene_paralelidad === 1);
					if (this.asignaturas_semestre.length === 0) {
						this.form.showMessageSinAsignaturasSecuencialesParalelas = true;
						this.form.showMessageSecuencialParalela = false;
						this.form.setStatusControlParalelidad(false);
					}else{
						this.form.showMessageSinAsignaturasSecuencialesParalelas = false;
						this.form.showMessageSecuencialParalela = true;
						this.form.setStatusControlParalelidad(true);
						this.form.setStatusControlSecuencialidad(false);
					}
				break;
			}
		}
	}

	resetDataSecuencialidadParalelidad(){
		this.form.fbForm.get('tiene_secuencialidad')!.reset();
		this.form.resetMessagesSecuencialidadParalelidad();
	}

	setDataToPendingForm(){
		const actual_values = {...this.form.dataExternal}
		this.form.dataExternal = {...actual_values,show: true}
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
			this.main.reset();
			this.mainAsignatura.setModeCrud('create');
		  break;
		}
	}

	selectPrerrequisitos(){
		// funcion que filtra la asignatura que tiene hijos (temas)
		let prerrequisitos_selected = [];
		prerrequisitos_selected = this.form.fbForm.get('pre_requisitos')?.value;
		prerrequisitos_selected = prerrequisitos_selected.filter( (pr: TreeNode) => pr.children?.length === 0)
		const updatedValues = prerrequisitos_selected.map((item: TreeNode) => {
			item.data.checkDisabled = true;
			return item;
		});
		this.form.setSelectControlPrerrequisitos(updatedValues)
	}

	selectSecuenciales(){
		// funcion que filtra la asignatura que tiene hijos (temas)
		let data = [];
		data = this.form.fbForm.get('secuencialidad')?.value;
		data = data.filter( (pr: TreeNode) => pr.children?.length === 0)
		const updatedValues = data.map((item: TreeNode) => {
			item.data.checkDisabled = true;
			return item;
		});
		this.form.setSelectControlSecuencialidad(updatedValues)
	}

	selectParalelas(){
		// funcion que filtra la asignatura que tiene hijos (temas)
		let data = [];
		data = this.form.fbForm.get('paralelidad')?.value;
		data = data.filter( (pr: TreeNode) => pr.children?.length === 0)
		const updatedValues = data.map((item: TreeNode) => {
			item.data.checkDisabled = true;
			return item;
		});
		this.form.setSelectControlParalelidad(updatedValues)

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

}
