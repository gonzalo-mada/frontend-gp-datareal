import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ModeDialogPE, PlanDeEstudio, UpdatePlanEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { AsignaturasPlancomunMainService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/main.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { FilesVerEditarPlanEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/files.service';
import { VerEditarPlanEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/main.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-pe-update',
  templateUrl: './form-pe-update.component.html',
  styles: [
  ]
})
export class FormPeUpdateComponent implements OnChanges {

	@Input() mode: ModeForm;
	@Input() modeDialogInput: UpdatePlanEstudio | undefined;
	@Input() planDeEstudio!: PlanDeEstudio;
	@Input() refreshPE: boolean = false;
	@Output() formUpdated = new EventEmitter();
	@Output() resetDialog = new EventEmitter();

	constructor(
		private backend: BackendPlanesDeEstudiosService,
		private confirmationService: ConfirmationService,
		private errorTemplateHandler: ErrorTemplateHandler,
		private files: FilesVerEditarPlanEstudioService,
		public form: FormPlanDeEstudioService,
		public main: VerEditarPlanEstudioMainService,
		private mainArticulacion: ArticulacionesMainService,
		private mainCertifInterPE: CertifIntermediasPEMainService,
		private mainRangosAG: RangosAGMainService,
		private mainMenciones: MencionesMainService,
		private mainAsignPC: AsignaturasPlancomunMainService
		
	){}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
			this.form.showButtonSubmitUpdate = false;
	  		let modeDialogFromInput : UpdatePlanEstudio = changes['modeDialogInput'].currentValue
			this.setForm(modeDialogFromInput.modeDialog , modeDialogFromInput.collection , modeDialogFromInput.isEditableBy);
		}
	}

	async setForm(modeDialog: ModeDialogPE, collection: CollectionsMongo, isEditableBy: boolean){
		this.main.dialogUpdateMode = modeDialog;
		this.files.resetLocalFiles();
		switch (modeDialog) {
			case 'articulacion': await this.initCreateFormUpdateArticulacion(isEditableBy); break
			case 'asign-pc': await this.initCreateFormUpdateAsignPlanComun(isEditableBy); break
			case 'certificacion': await this.initCreateFormUpdateCertificacion(isEditableBy); break
			case 'rangos': await this.initCreateFormUpdateRangos(isEditableBy); break
			case 'menciones': await this.initCreateFormUpdateMenciones(isEditableBy); break
			default: await this.main.createFormUpdate(modeDialog, collection, isEditableBy); break;
		}
	}

	changeEstadoPlanEstudio(event: any){
		let dataSelected = this.main.estados.find( c => c.cod_estado === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.descripcion_estado);
	}

	changeModalidad(event: any){
		let dataSelected = this.main.modalidades.find( c => c.Cod_modalidad === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.Descripcion_modalidad);
	}

	changeJornada(event: any){
		let dataSelected = this.main.jornadas.find( c => c.Cod_jornada === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.Descripcion_jornada);
	}

	changeRegimen(event: any){
		let dataSelected = this.main.regimenes.find( c => c.Cod_regimen === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.Descripcion_regimen);
	}

	closeDialog(){
		this.resetDialog.emit();
		this.main.enabledButtonSeleccionar();
	}

	async submit(){
		const response = await this.main.updateForm()
		this.formUpdated.emit(response)
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

	async initCreateFormCertifIntermPE(){
		this.setDataToPendingForm();
		await this.mainCertifInterPE.setModeCrud('create');
	}

	async initCreateFormRangosAG(){
		this.setDataToPendingForm();
		await this.mainRangosAG.setModeCrud('create');
	}

	async initCreateMencion(){
		this.setDataToPendingForm();
		await this.mainMenciones.setModeCrud('create');
	}

	async initCreateAsignPC(){
		this.setDataToPendingForm();
		await this.mainAsignPC.setModeCrud('create');
	}

	async initCreateFormUpdateAsignPlanComun(isEditableBy: boolean){
		try {
			await this.files.setContextUploader('edit', 'plandeestudio', 'ver/editar-plandeestudio', 'asign-pc');
			await this.form.setFormUpdate('asign-pc', this.planDeEstudio, isEditableBy);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_plan_comun')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_plan_comun')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.planDeEstudio.cod_plan_estudio!,'asign-pc');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_plan_comun',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de asignaturas para plan común. Intente nuevamente.',
				});
		}
	}

	changeSwitchTienePlanComun(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_plan_comun',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async initCreateFormUpdateCertificacion(isEditableBy: boolean){
		try {
			await this.files.setContextUploader('edit', 'plandeestudio', 'ver/editar-plandeestudio', 'certificacion_intermedia_pe');
			await this.form.setFormUpdate('certificacion', this.planDeEstudio, isEditableBy);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_certificacion')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_certificacion')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.planDeEstudio.cod_plan_estudio!,'certificacion_intermedia_pe');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_certificacion',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de certificaciones intermedias. Intente nuevamente.',
				});
		}
	}

	changeSwitchTieneCertificacion(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_certificacion',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async initCreateFormUpdateMenciones(isEditableBy: boolean){
		try {
			await this.files.setContextUploader('edit', 'plandeestudio', 'ver/editar-plandeestudio', 'menciones_pe');
			await this.form.setFormUpdate('menciones', this.planDeEstudio, isEditableBy);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_mencion')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_mencion')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.planDeEstudio.cod_plan_estudio!,'menciones_pe');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_mencion',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de menciones. Intente nuevamente.',
				});
		}
	}

	changeSwitchTieneMenciones(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_mencion',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async initCreateFormUpdateRangos(isEditableBy: boolean){
		try {
			await this.files.setContextUploader('edit', 'plandeestudio', 'ver/editar-plandeestudio', 'rangos');
			await this.form.setFormUpdate('rangos', this.planDeEstudio, isEditableBy);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_rango_aprob_g')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_rango_aprob_g')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.planDeEstudio.cod_plan_estudio!,'rangos');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_rango_aprob_g',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de rangos de aprobación. Intente nuevamente.',
				});
		}
	}

	changeSwitchTieneRangos(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_rango_aprob_g',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async initCreateFormUpdateArticulacion(isEditableBy: boolean){
		try {
			await this.files.setContextUploader('edit', 'plandeestudio', 'ver/editar-plandeestudio', 'articulaciones');
			await this.form.setFormUpdate('articulacion', this.planDeEstudio, isEditableBy);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_articulacion')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_articulacion')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.planDeEstudio.cod_plan_estudio!,'articulaciones');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_articulacion',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de articulaciones. Intente nuevamente.',
				});
		}
	}

	changeSwitchTieneArticulacion(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_articulacion',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async openConfirmationDelete(valueControl: any , dialogUpdateMode: 'articulacion' | 'certificacion' | 'rangos' | 'menciones' | 'asign-pc'){
		let message : string = '';
		switch (dialogUpdateMode) {
			case 'articulacion':
				message = 'Esta acción eliminará <b>TODAS</b> las articulaciones entre las asignaturas del plan de estudio y asignaturas de pregrado. ¿Desea confirmar?'
			break;
			case 'certificacion':
				message = 'Esta acción eliminará <b>TODAS</b> las asociaciones entre asignaturas y certificaciones intermedias del plan de estudio. ¿Desea confirmar?'
			break;
			case 'rangos':
				message = 'Esta acción eliminará <b>TODOS</b> los rangos de aprobación del plan de estudio. ¿Desea confirmar?'
			break;
			case 'menciones':
				message = 'Esta acción eliminará <b>TODAS</b> las menciones del plan de estudio. ¿Desea confirmar?'
			break;
			case 'asign-pc':
				message = 'Esta acción eliminará <b>TODAS</b> las asociaciones entre asignaturas del plan de estudio y un plan común. ¿Desea confirmar?'
			break;
		}
		if (valueControl === 0) {
			this.confirmationService.confirm({
				header: 'Confirmar',
				message: message,
				acceptLabel: 'Si',
				rejectLabel: 'No',
				icon: 'pi pi-exclamation-triangle',
				key: 'main-gp',
				acceptButtonStyleClass: 'p-button-danger p-button-sm',
				rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
				accept: async () => {
					this.submit();
				}
			})
		}else{
			this.submit();
		}
    }

	test(){
		console.log("fbFormUpdate",this.form.fbFormUpdate.value);
		console.log("stateFormUpdate PEService: ",this.form.stateFormUpdate);
		
		Object.keys(this.form.fbFormUpdate.controls).forEach(key => {
		  const control = this.form.fbFormUpdate.get(key);
		  if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		  }else{
			console.log("sin errores.")
		  }
		});
	}
}
