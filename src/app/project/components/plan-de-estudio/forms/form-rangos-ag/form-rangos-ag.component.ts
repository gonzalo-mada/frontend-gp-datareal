import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormRangosAGService } from 'src/app/project/services/plan-de-estudio/rangos-ag/form.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-form-rangos-ag',
  templateUrl: './form-rangos-ag.component.html',
  styles: [
  ]
})
export class FormRangosAgComponent implements OnInit, OnDestroy {

	@Input() dataExternal: DataExternal = { data: false };
  	@Output() formWasClosed = new EventEmitter<boolean>();
  	private subscription: Subscription = new Subscription();

  	constructor(
		public form: FormRangosAGService,
    	public main: RangosAGMainService,
		public mainFacultad: FacultadesMainService
  	){}
  
	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm;}));
		this.dataExternal.data ? await this.setFormByExternalData() : this.initForm();
	}

	ngOnDestroy(): void {
		this.main.showTable = false;
		this.subscription.unsubscribe();
	}
	
	async setFormByExternalData(){
		this.form.setDataExternal(this.dataExternal);
		this.form.setValuesVarsByDataExternal();
		await Promise.all([
			this.main.getProgramasPorFacultad(false),
			this.main.getPlanesDeEstudiosPorPrograma(false),
		]);
	}
	
	async initForm(){
		this.form.setDataExternal(this.dataExternal);
	}
	
	async submit() {
		this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
	}

	async changeFacultadPostgrado(event:any){
		this.main.resetArraysWhenChangedDropdownFacultad();
		this.form.resetControlsWhenChangedDropdownFacultadPostgrado();
		this.form.disabledControlsWhenChangedDropdownFacultadPostgrado();
		this.form.cod_facultad_selected_postgrado = event.value;
		await this.main.getProgramasPorFacultad();
	}

	async changeProgramaPostgrado(event:any){
		this.main.resetArraysWhenChangedDropdownPrograma();
		this.form.resetControlsWhenChangedDropdownProgramaPostgrado();
		this.form.disabledControlsWhenChangedDropdownProgramaPostgrado();
		this.form.cod_programa_postgrado_selected = event.value;
		await this.main.getPlanesDeEstudiosPorPrograma();
	}

	async changePlanDeEstudio(event:any){
		this.form.cod_planestudio_selected = event.value;
	}

	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		  const control = this.form.fbForm.get(key);
		  if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		  }
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
	}
}