import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ModeDialogPE, PlanDeEstudio, UpdatePlanEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { BackendPlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/backend.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { FilesVerEditarPlanEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/files.service';
import { VerEditarPlanEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/ver-editar-plan-de-estudio/main.service';

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
		
	){}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
			console.log("MODE DIALOG: ",changes['modeDialogInput'].currentValue);
			this.form.showButtonSubmitUpdate = false;
	  		let modeDialogFromInput : UpdatePlanEstudio = changes['modeDialogInput'].currentValue
			this.setForm(modeDialogFromInput.modeDialog , modeDialogFromInput.collection);
		}
	}

	async setForm(modeDialog: ModeDialogPE, collection: CollectionsMongo){
		this.main.dialogUpdateMode = modeDialog;
		this.files.resetLocalFiles();
		switch (modeDialog) {
			default: 
			await this.main.createFormUpdate(modeDialog, collection); 
			break;
		}
	}

	changeEstadoPlanEstudio(event: any){
		let dataSelected = this.main.estados.find( c => c.cod_estado === event.value );
		this.form.fbFormUpdate.get('description_new')?.patchValue(dataSelected.descripcion_estado);
	}

	closeDialog(){
		this.resetDialog.emit();
		this.main.enabledButtonSeleccionar();
	}

	async submit(){
		// this.main.programa = this.programa
		// const response = await this.main.updateForm()
		// this.formUpdated.emit(response)
	  }

}
