import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
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

	@Input() externalData: any = { data: false };
	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormTemasService,
		public main: TemasMainService,
		public mainFacultad: FacultadesMainService
	){}

	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		this.externalData.data ? await this.setFormByExternalData() : this.initForm();
	}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['externalData'] && changes['externalData'].currentValue.data && changes['externalData'].currentValue.show) {
			await this.setFormByExternalData()
		}else{
			await this.initForm()
		}
	}

	ngOnDestroy(): void {
		this.main.showTable = false
		this.subscription.unsubscribe();
	}

	async setFormByExternalData(){
		this.form.setValuesVarsByExternalData(this.externalData);
		this.main.cod_programa_selected = this.externalData.cod_programa;
		await Promise.all([
			this.mainFacultad.getFacultades(false),
			this.main.getProgramasPorFacultad(false),
		]);
		this.form.setControlsFormByExternalData(this.externalData);
	}

	async initForm(){
		await this.mainFacultad.getFacultades(false);
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
}
