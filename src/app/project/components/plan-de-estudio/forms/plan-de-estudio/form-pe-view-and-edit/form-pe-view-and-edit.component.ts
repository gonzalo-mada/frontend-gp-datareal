import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ModeDialogPE, PlanDeEstudio, UpdatePlanEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { LoadinggpService } from 'src/app/project/services/components/loadinggp.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { PlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/main.service';
import { VerEditarPlanEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/main.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';

@Component({
  selector: 'app-form-pe-view-and-edit',
  templateUrl: './form-pe-view-and-edit.component.html',
  styles: [
  ]
})
export class FormPeViewAndEditComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();
	loading: boolean = true
	planDeEstudio: PlanDeEstudio = {};
	updatePE!: UpdatePlanEstudio | undefined; 
	onClickRefreshPE: boolean = false;
	logsPE: any[] = [];

	constructor(
		private backend: BackendPlanesDeEstudiosService,
		private errorTemplateHandler: ErrorTemplateHandler,
		public mainPE: PlanDeEstudioMainService,
		public main: VerEditarPlanEstudioMainService,
		private systemService: LoadinggpService,
		public form: FormPlanDeEstudioService,
		private mainArticulacion: ArticulacionesMainService,
		private mainCertifIntermediaPE: CertifIntermediasPEMainService,
		private mainRangosAG: RangosAGMainService,
		private mainMenciones: MencionesMainService	
	){}

	async ngOnInit() {
		this.subscription.add(this.mainArticulacion.onActionToBD$.subscribe(() => this.getArticulacionesPorPlanDeEstudio()));
		this.subscription.add(this.mainCertifIntermediaPE.onInsertedData$.subscribe(() => this.getCertifIntermediaPorPlanDeEstudio()));
		this.subscription.add(this.mainRangosAG.onInsertedData$.subscribe(() => this.getRangosPorPlanDeEstudio()));
		this.subscription.add(this.mainMenciones.onActionToBD$.subscribe(() => this.getMencionesPorPlanDeEstudio()));
		await this.getPlanDeEstudio();
		await this.getData();
	}
	
	ngOnDestroy(): void {
		this.form.resetForm();
	}

	get mode(){
		return this.mainPE.mode
	}

	async refreshPlanDeEstudio(){
		await this.getPlanDeEstudio();
		await this.getData();
		this.onClickRefreshPE = true;
		setTimeout(() => {
		  this.onClickRefreshPE = false
		}, 500); 
	}

	async getPlanDeEstudio(){
		this.systemService.loading(true);
		this.loading = true;
		this.mainPE.planDeEstudio = await this.backend.getPlanDeEstudio({Cod_plan_estudio: this.mainPE.cod_plan_estudio},false,this.mainPE.namesCrud);
		// console.log("this.mainPE.planDeEstudio",this.mainPE.planDeEstudio);
		this.form.resetForm(false);
		this.form.setForm(this.mainPE.planDeEstudio, this.mainPE.cod_facultad_selected);
		this.form.fbForm.disable();
	}

	async getData(){
		try {
			await Promise.all([
				this.setNames(),
				this.getEstadosPlanEstudio(),
				this.getModalidades(),
				this.getJornadas(),
				this.getRegimenes(),
				this.getReglamentos(),
				this.getArticulacionesPorPlanDeEstudio(),
				this.getCertifIntermediaPorPlanDeEstudio(),
				this.getAsignaturasPorPlanDeEstudio(),
				this.getMencionesPorPlanDeEstudio(),
				this.getRangosPorPlanDeEstudio(),
				this.getLogPE(),
			]);
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al obtener el programa. Intente nuevamente.',
			});
		}finally{
			this.systemService.loading(false);
			this.loading = false;
		}
	}

	async getEstadosPlanEstudio(){
		this.main.estados = await this.backend.getEstadosPlanEstudio(false);
		let estadoSelected = this.main.estados.find( e => e.cod_estado === this.mainPE.planDeEstudio.cod_estado);
		this.form.setSelectEstadoPlanEstudio(estadoSelected);
	}

	async getModalidades(){
		this.main.modalidades = await this.backend.getModalidades(false);
		let modalidadSelected = this.main.modalidades.find( m => m.Cod_modalidad === this.mainPE.planDeEstudio.cod_modalidad);
		this.form.setSelectModalidad(modalidadSelected)
	}

	async getJornadas(){
		this.main.jornadas = await this.backend.getJornadas(false);
		let jornadaSelected = this.main.jornadas.find( j => j.Cod_jornada === this.mainPE.planDeEstudio.cod_jornada);
		this.form.setSelectJornada(jornadaSelected)
	}

	async getRegimenes(){
		this.main.regimenes = await this.backend.getRegimenes(false);
		let regimenSelected = this.main.regimenes.find( r => r.Cod_regimen === this.mainPE.planDeEstudio.cod_regimen);
		this.form.setSelectRegimen(regimenSelected)
	}

	async getReglamentos(){
		this.main.reglamentos = await this.backend.getReglamentos(false);
		let reglamentoSelected = this.main.reglamentos.find( r => r.Cod_reglamento === this.mainPE.planDeEstudio.cod_reglamento);
		this.form.setSelectReglamento(reglamentoSelected,false)
	}

	async getArticulacionesPorPlanDeEstudio(){
        let params = { cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio }
		this.mainArticulacion.articulaciones = await this.backend.getArticulacionesPorPlanDeEstudio(params,false);
		this.form.setSelectArticulacion(this.mainPE.planDeEstudio.tiene_articulacion,this.mainArticulacion.articulaciones.length)
	}

	async getCertifIntermediaPorPlanDeEstudio(){
		let params = { cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio };
		this.mainCertifIntermediaPE.certificaciones = await this.backend.getCertifIntermediasPorPlanDeEstudio(params,false);
		this.form.setSelectCertifIntermedia(this.mainPE.planDeEstudio.tiene_certificacion,this.mainCertifIntermediaPE.certificaciones.length)
	}

	async getAsignaturasPorPlanDeEstudio(){
		//todo: PENDIENTE POR FALTA DE TABLA ASIGNATURA
		let params = { cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio };
		this.main.asignaturas = await this.backend.getAsignaturasPorPlanDeEstudio(params,false);
		// console.log("this.main.asignaturas",this.main.asignaturas);
		
		this.form.setSelectAsignaturas(this.main.asignaturas.length)
	}

	async getMencionesPorPlanDeEstudio(){
		let params = { cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio };
		this.mainMenciones.menciones = await this.backend.getMencionesPorPlanDeEstudio(params,false);
		this.form.setSelectMenciones(this.mainPE.planDeEstudio.tiene_mencion,this.mainMenciones.menciones.length)
	}

	async getRangosPorPlanDeEstudio(){
		let params = { cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio };
		this.mainRangosAG.rangosAG = await this.backend.getRangosPorPlanDeEstudio(params,false);
		this.form.setSelectRangos(this.mainPE.planDeEstudio.tiene_rango_aprob_g,this.mainRangosAG.rangosAG.length)
	}

	async getLogPE(){
		this.logsPE = await this.backend.getLogPE({cod_plan_estudio: this.mainPE.planDeEstudio.cod_plan_estudio},false);
	}

	async setNames(){
		this.form.setNames(this.mainPE.planDeEstudio)
	}

	async openDialog(modeDialog: ModeDialogPE, collection: CollectionsMongo){
		try {
		  this.updatePE = {modeDialog , collection};
		} catch (error) {
		  console.log("error en openDialog()",error);
		  this.errorTemplateHandler.processError(error, {
			notifyMethod: 'alert',
			message: 'Hubo un error al generar formulario. Intente nuevamente.',
		  });
		}
	}

	getToolTip(isEditable: boolean): string {
		let message = '';
		if (isEditable) {
		  this.mode === 'show' ? message = 'Ver mas detalles' : message = 'Editar registro'
		  return message
		}else{
		  this.mode === 'show' ? message = 'No cuenta con mas detalles' : message = 'No es posible editar'
		  return message
		}
	}

	test(){
		console.log("inputs",this.form.inputs);
		console.log("filteredInputs",this.form.filteredInputs);
		console.log("fbForm",this.form.fbForm.value);
		// console.log("fbFormUpdate",this.form.fbFormUpdate.value);
		// console.log("stateFormUpdate programaService: ",this.form.stateFormUpdate);
		
		// Object.keys(this.form.fbForm.controls).forEach(key => {
		//   const control = this.form.fbFormUpdate.get(key);
		//   if (control?.invalid) {
		// 	console.log(`Errores en ${key}:`, control.errors);
		//   }
		// });

		this.form.getValuesSelected();
		this.form.getValuesIndex();
	}

	getDynamicPrincipalValue(input: any): any {
		if (input.control) {
		  return this.form.fbForm.get(input.control)?.value; 
		}
		if (input.principalValue) {
		  return this.resolveValue(input.principalValue); 
		}
		if (input.secondaryValue) {
		  return this.resolveValue(input.secondaryValue); 
		}
		return null; // Si no hay control ni inputValue
	}
	
	getDynamicSecondaryValue(input: any): any {
		if (input.secondaryValue) {
		  return this.resolveValue(input.secondaryValue); 
		}
		return null; // Si no hay control ni inputValue
	}
	  
	private resolveValue(value: string): any {
		return value.split('.').reduce((acc: any, key: any) => acc?.[key], this); // Resolver valor dinámico como 'form.inputEstadoAcreditacion'
	}

	async formUpdated(){
		try {
			await this.getPlanDeEstudio();
			this.loading = true;
			await this.getData();
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al obtener registros tras actualización. Intente nuevamente.',
			});
		}finally{
			this.systemService.loading(false);
			this.loading = false;
		}
	}

	resetDialog(){
		this.updatePE = undefined;
	}
}
