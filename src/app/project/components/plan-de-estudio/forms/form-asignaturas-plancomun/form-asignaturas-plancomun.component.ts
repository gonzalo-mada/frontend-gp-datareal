import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormAsignaturasPlancomunService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/form.service';
import { AsignaturasPlancomunMainService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/main.service';
import { TableAsignaturasPlancomunService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-form-asignaturas-plancomun',
  templateUrl: './form-asignaturas-plancomun.component.html',
  styles: [
  ]
})
export class FormAsignaturasPlancomunComponent implements OnInit, OnDestroy {
	@Input() dataFromAgregarPE: any = { data: false };
  	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormAsignaturasPlancomunService,
		public main: AsignaturasPlancomunMainService,
		public table: TableAsignaturasPlancomunService,
		 public mainFacultad: FacultadesMainService
	){}
	
	async ngOnInit() {
		console.log("dataFromAgregarPE",this.dataFromAgregarPE);
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		this.dataFromAgregarPE.data ? await this.setFormByAgregarPE() : await this.mainFacultad.getFacultades(false);		
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	async setFormByAgregarPE(){
		this.form.setValuesVarsByAgregarPE(this.dataFromAgregarPE);
		this.main.cod_plan_estudio_selected_notform = this.dataFromAgregarPE.cod_plan_estudio;
		await this.main.getProgramasPorFacultadOrigen(false);
		await this.main.getPlanesDeEstudiosPorProgramaOrigen(false);
		await this.main.getAsignaturasPorPlanDeEstudioOrigen(false);
		await this.mainFacultad.getFacultades(false);
		this.form.setControlsFormByAgregarPE(this.dataFromAgregarPE);
		this.main.wasFilteredTable = true;
	}

	async submit(){
		this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
	}

	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		  const control = this.form.fbForm.get(key);
		  if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		  }
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
		// console.log("ROW SELECTED PROGRAMA:",this.table.selectedCertifIntermediaRows);
		console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}

	async changeFacultadOrigen(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownFacultadOrigen();
		this.form.resetControlsWhenChangedDropdownFacultadOrigen();
		this.form.disabledControlsWhenChangedDropdownFacultadOrigen();
		this.form.cod_facultad_selected_origen = event.value;
		if (this.main.showTables) this.main.showTables = false
		await this.main.getProgramasPorFacultadOrigen();
	}

	async changeFacultadDestino(event:any){
		this.main.resetArraysWhenChangedDropdownFacultadDestino();
		this.form.resetControlsWhenChangedDropdownFacultadDestino();
		this.form.disabledControlsWhenChangedDropdownFacultadDestino();
		this.form.cod_facultad_selected_destino = event.value;
		await this.main.getProgramasPorFacultadDestino();
	}

	async changeProgramaOrigen(event: any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownProgramaOrigen();
		this.form.resetControlWhenChangedDropdownProgramaOrigen();
		this.form.disabledControlWhenChangedDropdownProgramaOrigen();
		this.form.cod_programa_origen = event.value;
		if (this.main.showTables) this.main.showTables = false
		await this.main.getPlanesDeEstudiosPorProgramaOrigen();
	}

	async changeProgramaDestino(event: any){
		this.main.resetArraysWhenChangedDropdownProgramaDestino();
		this.form.resetControlWhenChangedDropdownProgramaDestino();
		this.form.disabledControlWhenChangedDropdownProgramaDestino();
		this.form.cod_programa_destno = event.value;
		await this.main.getPlanesDeEstudiosPorProgramaDestino();
	}

	async changePlanDeEstudioOrigen(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownPE();
		this.form.resetFormWhenChangedDropdownPEOrigen();
		this.form.cod_planestudio_selected = event.value;
		await this.main.getAsignaturasPorPlanDeEstudioOrigen();
	}

	async changePlanDeEstudioDestino(event:any){
		this.main.showTables = true;
	}

	selectAsignatura(event: any){
		this.form.fbForm.patchValue({ Asignaturas: event });
	}

	clearTableAsignatura(){
		this.table.resetSelectedRowsTableAsignaturas();
		this.form.fbForm.patchValue({ Asignaturas: '' });
	}

}
