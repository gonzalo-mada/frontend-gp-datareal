import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormTemasService } from 'src/app/project/services/asignaturas/temas/form.service';
import { TemasMainService } from 'src/app/project/services/asignaturas/temas/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-form-temas',
  templateUrl: './form-temas.component.html',
  styles: [
  ]
})
export class FormTemasComponent {
  	@Input() dataExternal: DataExternal = { data: false };
	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormTemasService,
		public main: TemasMainService,
		public mainFacultades: FacultadesMainService
	){}

	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		this.dataExternal.data ? await this.setFormByExternalData() : this.initForm();
	}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['dataExternal'] && changes['dataExternal'].currentValue.data ) {
			console.log("ACTIVE ON CHANGE TEMAS CON:",this.dataExternal);
			
			this.form.setDataExternal(this.dataExternal);
		}
	}

	ngOnDestroy(): void {
		this.main.showTable = false
		this.subscription.unsubscribe();
	}

	async setFormByExternalData(){
		this.form.setDataExternal(this.dataExternal);
		this.form.setValuesVarsByDataExternal();
		await Promise.all([
		  this.main.getProgramasPorFacultad(false),
		]);
	}

	async initForm(){
		this.form.setDataExternal(this.dataExternal);
	}

	async submit(){
		this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
	}

	async changeFacultad(event:any){
		this.main.resetArraysWhenChangedDropdownFacultad();
		this.form.resetControlsWhenChangedDropdownFacultad();
		this.form.disabledControlsWhenChangedDropdownFacultad();
		this.form.cod_facultad_selected = event.value;
		await this.main.getProgramasPorFacultad();
	}

	async changeProgramaPostgrado(event:any){
		this.form.cod_programa_selected = event.value;
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
