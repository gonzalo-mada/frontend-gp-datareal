import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Asignatura, ModeDialogAsign, UpdateAsign } from 'src/app/project/models/asignaturas/Asignatura';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { BackendAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/backend.service';
import { FormAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/form.service';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';
import { VerEditarAsignaturaMainService } from 'src/app/project/services/asignaturas/asignaturas/ver-editar-asignatura/main.service';
import { LoadinggpService } from 'src/app/project/services/components/loadinggp.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';

@Component({
  selector: 'app-form-asign-view-and-edit',
  templateUrl: './form-asign-view-and-edit.component.html',
  styles: [
  ]
})
export class FormAsignViewAndEditComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();
	loading: boolean = true;
	asignatura: Asignatura = {};
	updateAsign!: UpdateAsign | undefined;
	onClickRefreshAsign: boolean = false;

	constructor(
		private backend: BackendAsignaturasService,
		private errorTemplateHandler: ErrorTemplateHandler,
		public mainAsign: AsignaturasMainService,
		public main: VerEditarAsignaturaMainService,
		private systemService: LoadinggpService,
		public form: FormAsignaturasService,
		private mainArticulacion: ArticulacionesMainService,
		private mainMenciones: MencionesMainService,
	){}

	async ngOnInit() {
		this.subscription.add(this.mainArticulacion.onActionToBD$.subscribe(() => this.getArticulaciones()));
		this.subscription.add(this.mainMenciones.onActionToBD$.subscribe(() => this.getMenciones()));
		this.main.setOrigen('asignaturas','asignaturas_s',this.mainAsign.cod_asignatura);
		await this.getAsignatura();
		await this.getData();
	}
	
	async ngOnDestroy() {
		this.form.resetForm();
	}

	get mode(){
		return this.mainAsign.mode
	}

	async getAsignatura(){
		this.systemService.loading(true);
		this.loading = true;
		let params = { cod_asignatura: this.mainAsign.cod_asignatura }
		this.mainAsign.asignatura = await this.backend.getAsignatura(params,false,this.mainAsign.namesCrud);
		console.log("DATA ASIGNATURA VIEW/EDIT",this.mainAsign.asignatura);
		this.form.resetForm(false, false);
		this.form.setForm(this.mainAsign.asignatura, this.mainAsign.cod_facultad_selected, this.mainAsign.cod_programa_selected);
		this.form.fbForm.disable();
	}

	async getData(){
		try {
			await Promise.all([
				this.getModalidades(),
				this.getRegimenes(),
				this.getArticulaciones(),
				this.getMenciones(),
				this.getPrerrequisitos(),
				this.getSecuencialidades(),
				this.getParalelidades(),
				this.getTiposEvaluaciones(),
				this.getTipoColegiada(),
				this.getTemas(),
				
			]);
		} catch (error) {
			// this.errorTemplateHandler.processError(error, {
			// 	notifyMethod: 'alert',
			// 	message: 'Hubo un error al obtener la asignatura. Intente nuevamente.',
			// });
		}finally{
			this.systemService.loading(false);
			this.loading = false;
		}
	}

	async getModalidades(){
		this.main.modalidades = await this.backend.getModalidades(false);
		let modalidadSelected = this.main.modalidades.find( m => m.Cod_modalidad === this.mainAsign.asignatura.cod_modalidad);
		this.form.setSelectModalidad(modalidadSelected);
	}

	async getRegimenes(){
		this.main.regimenes = await this.backend.getRegimenes(false);
		let regimenSelected = this.main.regimenes.find( r => r.Cod_regimen === this.mainAsign.asignatura.cod_regimen);
		this.form.setSelectRegimen(regimenSelected);
	}

	async getArticulaciones(){
        let params = { cod_asignatura: this.mainAsign.cod_asignatura }
		this.main.articulaciones = await this.backend.getArticulacionesPorAsignatura(params,false);
		this.form.setSelectArticulacion(this.mainAsign.asignatura.tiene_articulacion,this.main.articulaciones)
	}

	async getMenciones(){
		this.main.menciones_asign = [];
		if (this.mainAsign.asignatura.tiene_mencion === 1) {
			let params = { cod_asignatura: this.mainAsign.cod_asignatura }
			this.main.menciones_asign = await this.backend.getMencionesPorAsignatura(params,false);
		}
		this.form.setSelectMenciones(this.mainAsign.asignatura.tiene_mencion,this.main.menciones_asign)
	}

	async getPrerrequisitos(){
		this.main.prerrequisitos_asign = [];
		if (this.mainAsign.asignatura.tiene_prerequisitos === 1) {
			let params = { cod_asignatura: this.mainAsign.cod_asignatura }
			this.main.prerrequisitos_asign = await this.backend.getPreRequisitosPorAsignatura(params,false);
		}
		this.form.setSelectPrerrequisitos(this.mainAsign.asignatura.tiene_prerequisitos,this.main.prerrequisitos_asign)
	}

	async getSecuencialidades(){
		this.main.secuencialidades_asign = [];
		if (this.mainAsign.asignatura.tiene_secuencialidad === 1) {
			let params = { cod_asignatura: this.mainAsign.cod_asignatura }
			this.main.secuencialidades_asign = await this.backend.getAsignsSecuencialesParalelasPorAsignatura(params,false);
		}
		this.form.setSelectSecuencialidades(this.mainAsign.asignatura.tiene_secuencialidad,this.main.secuencialidades_asign)
	}

	async getParalelidades(){
		this.main.secuencialidades_asign = [];
		if (this.mainAsign.asignatura.tiene_paralelidad === 1) {
			let params = { cod_asignatura: this.mainAsign.cod_asignatura }
			this.main.secuencialidades_asign = await this.backend.getAsignsSecuencialesParalelasPorAsignatura(params,false);
		}
		this.form.setSelectParalelidades(this.mainAsign.asignatura.tiene_paralelidad,this.main.secuencialidades_asign)
	}

	async getTiposEvaluaciones(){
		this.main.tipos_evaluaciones = await this.backend.getTiposEvaluacion(false);
		let tipoEvaSelected = this.main.tipos_evaluaciones.find( t => t.cod_tipo === this.mainAsign.asignatura.cod_tipo_evaluacion)
		this.form.setSelectTipoEvaluacion(tipoEvaSelected)
	}

	async getTipoColegiada(){
		this.main.tipos_colegiadas = await this.backend.getTiposColegiadas(false);
		let tipoColegiadaSelected = this.main.tipos_colegiadas.find( t => t.cod_tipo === this.mainAsign.asignatura.cod_tipo_colegiada)
		this.form.setSelectTipoColegiada(tipoColegiadaSelected)
	}

	async getTemas(){
		this.main.temas_asign = [];
		let params = { cod_programa: this.mainAsign.asignatura.cod_programa }
		this.main.temas = await this.backend.getTemasPorPrograma(params,false);
		if (this.mainAsign.asignatura.tiene_tema === 1) {
			let params = { cod_asignatura: this.mainAsign.cod_asignatura }
			this.main.temas_asign = await this.backend.getTemasPorAsignatura(params,false);
		}
		this.form.setSelectTemas(this.mainAsign.asignatura.tiene_tema,this.main.temas_asign)
	}

	async refreshAsignatura(){
		await this.getAsignatura();
		await this.main.refreshHistorialActividad();
		await this.getData();
		this.onClickRefreshAsign = true;
		setTimeout(() => {
		  this.onClickRefreshAsign = false
		}, 500); 
	}

	async openDialog(modeDialog: ModeDialogAsign, collection: CollectionsMongo, canEdit: boolean){
		try {
			this.updateAsign = {modeDialog , collection, canEdit};
		} catch (error) {
			console.log("error en openDialog()",error);
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al generar formulario. Intente nuevamente.',
			});
		}
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
		return value.split('.').reduce((acc: any, key: any) => acc?.[key], this); 
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

	async formUpdated(){
		try {
			await this.getAsignatura();
			await this.main.refreshHistorialActividad();
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
		this.updateAsign = undefined;
	}

	test(){

	}

}
