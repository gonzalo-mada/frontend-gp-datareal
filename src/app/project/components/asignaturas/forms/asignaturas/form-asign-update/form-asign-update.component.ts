import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Asignatura, ModeDialogAsign, UpdateAsign } from 'src/app/project/models/asignaturas/Asignatura';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { FormAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/form.service';
import { FilesVerEditarAsignatura } from 'src/app/project/services/asignaturas/asignaturas/ver-editar-asignatura/files.service';
import { VerEditarAsignaturaMainService } from 'src/app/project/services/asignaturas/asignaturas/ver-editar-asignatura/main.service';
import { ParalelaSecuencialMainService } from 'src/app/project/services/asignaturas/paralela-secuencial/main.service';
import { PrerrequisitosMainService } from 'src/app/project/services/asignaturas/prerrequisitos/main.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-asign-update',
  templateUrl: './form-asign-update.component.html',
  styles: []
})
export class FormAsignUpdateComponent implements OnChanges {
	
	@Input() mode: ModeForm;
	@Input() modeDialogInput: UpdateAsign | undefined;
	@Input() asignatura!: Asignatura;
	@Input() refreshAsign: boolean = false;
	@Output() formUpdated = new EventEmitter();
	@Output() resetDialog = new EventEmitter();

	constructor(
		private confirmationService: ConfirmationService,
		private errorTemplateHandler: ErrorTemplateHandler,
		private files: FilesVerEditarAsignatura,
		public form: FormAsignaturasService,
		public main: VerEditarAsignaturaMainService,
		private mainArticulacion: ArticulacionesMainService,
		private mainMencion: MencionesMainService,
		private mainPrerrequisito: PrerrequisitosMainService,
		private mainParalelidadSecuencialidad: ParalelaSecuencialMainService
	){}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
			// console.log("MODE DIALOG: ",changes['modeDialogInput'].currentValue);
			this.form.showButtonSubmitUpdate = false;
			let modeDialogFromInput : UpdateAsign = changes['modeDialogInput'].currentValue
			this.setForm(modeDialogFromInput.modeDialog , modeDialogFromInput.collection, modeDialogFromInput.canEdit);
		}
	}

	async setForm(modeDialog: ModeDialogAsign, collection: CollectionsMongo, canEdit: boolean){
		this.main.dialogUpdateMode = modeDialog;
		this.files.resetLocalFiles();
		switch (modeDialog) {
			case 'cod_tipo_colegiada': await this.createFormTieneColegiada(canEdit); break;
			case 'tiene_mencion': await this.createFormTieneMencion(canEdit); break;
			case 'tiene_prerequisitos': await this.createFormTienePreRequisitos(canEdit); break;
			case 'tiene_articulacion': await this.createFormTieneArticulacion(canEdit); break;
			case 'tiene_secuencialidad': await this.createFormTieneSecuencialidad(canEdit); break;
			case 'tiene_tema': await this.createFormTieneTema(canEdit); break;
			default: await this.main.createFormUpdate(modeDialog, collection, canEdit); break;
		}
	}

	changeModalidad(event: any){
		let dataSelected = this.main.modalidades.find( c => c.Cod_modalidad === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.Descripcion_modalidad);
	}

	changeRegimen(event: any){
		let dataSelected = this.main.regimenes.find( c => c.Cod_regimen === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.Descripcion_regimen);
	}

	changeTipoEvaluacion(event: any){
		let dataSelected = this.main.tipos_evaluaciones.find( c => c.cod_tipo === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.descripcion_tipo);
	}

	changeTipoColegiada(event: any){
		let dataSelected = this.main.tipos_colegiadas.find( c => c.cod_tipo === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.descripcion_tipo);
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

	async initCreateFormPrerrequisito(){
		this.setDataToPendingForm();
		await this.mainPrerrequisito.setModeCrud('create');
	}

	async initCreateFormSecuencialidadParalelidad(){
		this.setDataToPendingForm();
		await this.mainParalelidadSecuencialidad.setModeCrud('create');
	}

	async initCreateFormMencion(){
		this.setDataToPendingForm();
		await this.mainMencion.setModeCrud('create');
	}

	async createFormTieneColegiada(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'tipo_colegiada_asign');
			await this.form.setFormUpdate('cod_tipo_colegiada', this.asignatura, canEdit);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_colegiada')!.disable();
				this.form.fbFormUpdate.get('cod_tipo_colegiada')!.disable();
			}
			const tiene_colegiada = this.form.fbFormUpdate.get('tiene_colegiada')!;
			if (tiene_colegiada.value === 0) {
				this.form.fbFormUpdate.get('cod_tipo_colegiada')?.disable()
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'tipo_colegiada_asign');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_colegiada',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de tipo de colegiada. Intente nuevamente.',
			  });
		}
	}

	changeSwitchTieneColegiada(event: any){
		const tipos_colegiada = this.form.fbFormUpdate.get('cod_tipo_colegiada')!;

		switch (event.checked) {
			case 1:
				tipos_colegiada.enable();
				this.main.enabledButtonSeleccionar(); 
			break;

			case 0:
				tipos_colegiada.disable();
				this.main.disabledButtonSeleccionar();
			break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_colegiada',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async createFormTienePreRequisitos(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'pre_requisitos_asign');
			await this.form.setFormUpdate('tiene_prerequisitos', this.asignatura, canEdit);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_prerequisitos')!.disable();
			}
			const tiene_prerequisitos = this.form.fbFormUpdate.get('tiene_prerequisitos')!;
			if (tiene_prerequisitos.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'pre_requisitos_asign');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_prerequisitos',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de prerrequisitos. Intente nuevamente.',
			  });
		}
	}

	changeSwitchTienePreRequisitos(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_prerequisitos',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async createFormTieneArticulacion(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'articulacion_asign');
			await this.form.setFormUpdate('tiene_articulacion', this.asignatura, canEdit);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_articulacion')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_articulacion')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'articulacion_asign');
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

	async createFormTieneMencion(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'mencion_asign');
			await this.form.setFormUpdate('tiene_mencion', this.asignatura, canEdit);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_mencion')!.disable();
			}
			const control = this.form.fbFormUpdate.get('tiene_mencion')!;
			if (control.value === 0) {
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'mencion_asign');
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

	changeSwitchTieneMencion(event: any){
		switch (event.checked) {
			case 1: this.main.enabledButtonSeleccionar(); break;
			case 0: this.main.disabledButtonSeleccionar(); break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_mencion',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async createFormTieneSecuencialidad(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'secuencialidad_asign');
			await this.form.setFormUpdate('tiene_secuencialidad', this.asignatura, canEdit);
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_secuencialidad')!.disable();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'secuencialidad_asign');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_secuencialidad',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de asignaturas secuenciales / paralelas. Intente nuevamente.',
			  });
		}
	}

	async createFormTieneTema(canEdit: boolean){
		try {
			await this.files.setContextUploader('edit', 'asignatura', 'ver/editar-asignatura', 'tema_asign');
			await this.form.setFormUpdate('tiene_tema', this.asignatura, canEdit);
			this.form.fbFormUpdate.patchValue({ temas: this.main.temas_asign , temas_old: this.main.temas_asign  });
			if (this.mode === 'show') {
				this.form.fbFormUpdate.get('tiene_tema')!.disable();
			}
			const tiene_mencion = this.form.fbFormUpdate.get('tiene_tema')!;
			if (tiene_mencion.value === 0) {
				this.form.fbFormUpdate.get('temas')?.disable()
				this.main.disabledButtonSeleccionar();
			}
			this.main.dialogUpdate = true;
			
			const response = await this.files.loadDocsWithBinary(this.asignatura.cod_asignatura!,'tema_asign');
			if (response) {
				this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_tema',() => this.mode as ModeForm)]);
				this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
				this.form.showButtonSubmitUpdate = true;
			} 
		} catch (error) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al crear el formulario de temas. Intente nuevamente.',
			  });
		}
	}

	changeSwitchTieneTema(event: any){
		const temas = this.form.fbFormUpdate.get('temas')!;

		switch (event.checked) {
			case 1:
				temas.enable();
				this.main.enabledButtonSeleccionar(); 
			break;

			case 0:
				temas.disable();
				this.main.disabledButtonSeleccionar();
			break;
		}
		this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'tiene_tema',() => this.mode as ModeForm)]);
		this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
	}

	async openConfirmationDelete(valueControl: any , dialogUpdateMode: 'tiene_prerequisitos' | 'tiene_articulacion' | 'tiene_secuencialidad' | 'tiene_mencion' | 'asign-pc'){
		let message : string = '';
		switch (dialogUpdateMode) {
			case 'tiene_articulacion':
				message = 'Esta acción eliminará <b>TODAS</b> las articulaciones entre la asignatura y asignaturas de pregrado. ¿Desea confirmar?'
			break;
			case 'tiene_secuencialidad':
				message = 'Esta acción eliminará <b>TODAS</b> las asociaciones entre la asignatura y sus asignaturas secuenciales o paralelas. ¿Desea confirmar?'
			break;
			case 'tiene_prerequisitos':
				message = 'Esta acción eliminará <b>TODOS</b> los prerrequisitos de la asignatura. ¿Desea confirmar?'
			break;
			case 'tiene_mencion':
				message = 'Esta acción eliminará <b>TODAS</b> las asociaciones entre la asignatura y menciones. ¿Desea confirmar?'
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
