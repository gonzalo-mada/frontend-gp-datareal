import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ModeDialogPE, PlanDeEstudio, UpdatePlanEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { FilesVerEditarPlanEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/files.service';
import { VerEditarPlanEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/main.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';

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
		private errorTemplateHandler: ErrorTemplateHandler,
		private files: FilesVerEditarPlanEstudioService,
		public form: FormPlanDeEstudioService,
		public main: VerEditarPlanEstudioMainService,
		private mainArticulacion: ArticulacionesMainService,
		private mainCertifInterPE: CertifIntermediasPEMainService,
		private mainRangosAG: RangosAGMainService,
		private mainMenciones: MencionesMainService
		
	){}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
			// console.log("MODE DIALOG: ",changes['modeDialogInput'].currentValue);
			this.form.showButtonSubmitUpdate = false;
	  		let modeDialogFromInput : UpdatePlanEstudio = changes['modeDialogInput'].currentValue
			this.setForm(modeDialogFromInput.modeDialog , modeDialogFromInput.collection);
		}
	}

	async setForm(modeDialog: ModeDialogPE, collection: CollectionsMongo){
		this.main.dialogUpdateMode = modeDialog;
		this.files.resetLocalFiles();
		switch (modeDialog) {
			default: await this.main.createFormUpdate(modeDialog, collection); break;
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

	externalFormWasClosed(){
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
