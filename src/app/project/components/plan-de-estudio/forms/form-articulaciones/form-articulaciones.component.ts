import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormArticulacionesService } from 'src/app/project/services/plan-de-estudio/articulaciones/form.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { TableArticulacionesService } from 'src/app/project/services/plan-de-estudio/articulaciones/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-form-articulaciones',
  templateUrl: './form-articulaciones.component.html',
  styles: [
  ]
})
export class FormArticulacionesComponent implements OnInit, OnDestroy  {

	@Input() dataExternal: DataExternal = { data: false };
	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormArticulacionesService,
		public main: ArticulacionesMainService,
		public table: TableArticulacionesService,
		public mainFacultad: FacultadesMainService
	){}

	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		this.dataExternal.data ? await this.setFormByExternalData() : this.initForm();
	}

	ngOnDestroy(): void {
		this.main.showTable = false;
		this.subscription.unsubscribe();
	}

	async setFormByExternalData(){
		this.form.setDataExternal(this.dataExternal);
		this.form.setValuesVarsByDataExternal();
		// this.main.cod_plan_estudio_selected_notform = this.dataExternal.cod_plan_estudio!;
		await Promise.all([
			this.mainFacultad.getFacultades(false),
			this.main.getProgramasPostgradoPorFacultad(false),
			this.main.getPlanesDeEstudiosPorPrograma(false),
		]);
		await this.main.getAsignaturasPorPlanDeEstudio(false)
		// this.form.setControlsFormByDataExternal();    
	}

	async initForm(){
		await this.mainFacultad.getFacultades(false);
		this.form.setDataExternal(this.dataExternal);
	}

	async submit(){
		this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
	}

	async changeFacultadPostgrado(event:any){
		this.table.resetSelectedAsignaturasPostgrado();
		this.main.resetArraysWhenChangedDropdownFacultadPostgrado();
		this.form.resetControlsWhenChangedDropdownFacultadPostgrado();
		this.form.resetArrowsColorsWhenChangedDropdownFacultadPostgrado();
		this.form.disabledControlsWhenChangedDropdownFacultadPostgrado();
		this.form.cod_facultad_selected_postgrado = event.value;
		await this.main.getProgramasPostgradoPorFacultad();
	}

	async changeProgramaPostgrado(event:any){
		this.table.resetSelectedAsignaturasPostgrado();
		this.main.resetArraysWhenChangedDropdownProgramaPostgrado();
		this.form.resetControlsWhenChangedDropdownProgramaPostgrado();
		this.form.resetArrowsColorsWhenChangedDropdownProgramaPostgrado();
		this.form.disabledControlsWhenChangedDropdownProgramaPostgrado();
		this.form.cod_programa_selected_postgrado = event.value;
		await this.main.getPlanesDeEstudiosPorPrograma();
	}

	async changePlanDeEstudio(event:any){
		this.table.resetSelectedAsignaturasPostgrado();
		this.form.cod_plan_estudio_selected = event.value;
		await this.main.getAsignaturasPorPlanDeEstudio();
	}

	async changeFacultadPregrado(event: any){
		this.main.resetArraysWhenChangedDropdownFacultadPregrado();
		this.form.resetControlsWhenChangedDropdownFacultadPregrado();
		this.form.resetArrowsColorsWhenChangedDropdownFacultadPregrado();
		this.form.disabledControlsWhenChangedDropdownFacultadPregrado();
		this.form.cod_facultad_selected_pregrado = event.value;
		await this.main.getProgramasPregradoPorFacultad();
	}

	async changeProgramaPregrado(event:any){
		this.main.resetArraysWhenChangedDropdownProgramaPregrado();
		this.form.resetControlsWhenChangedDropdownProgramaPregrado();
		this.form.resetArrowsColorsWhenChangedDropdownAsignaturasPregrado();
		this.form.disabledControlsWhenChangedDropdownProgramaPregrado();
		this.form.cod_programa_selected_pregrado = event.value.codPrograma;
		this.form.nombre_programa_selected_pregrado = event.value.nombreCarrera;
		this.form.fbForm.patchValue({ data_programa_pregrado: event.value });
		await this.main.getAsignaturasPorProgramaPregrado();
	}

	changeAsignaturasPregrado(event: any){
		this.table.pushSelectedAsignaturaPregrado(event.itemValue)
		this.form.setAsignaturaArticuladas(this.table.selectedAsignaturaPregrado);
	}

	selectAsignaturaPostgrado(event: any){
		this.form.setAsignaturaPostgrado(event);
	}

	formClosed(){
		this.formWasClosed.emit();
	}

	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		const control = this.form.fbForm.get(key);
		if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		}
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
		console.log("VALORES COLORES:",this.form.arrowsColors);
		// console.log("ROW SELECTED PROGRAMA:",this.table.selectedProgramaRows);
		// console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}

	clearTableAsignaturaPregrado(){
		this.table.resetSelectedAsignaturasPregrado();
		this.form.setAsignaturaPregrado('');
		this.form.resetControlAsignaturaPregrado();
	}

	clearTableAsignaturaPostgrado(){
		this.table.resetSelectedAsignaturasPostgrado();
		this.form.resetControlAsignaturaPostgrado();
		this.form.setAsignaturaPostgrado('');
	}

}
