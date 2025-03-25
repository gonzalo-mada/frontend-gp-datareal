import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/form.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { TableMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { parseAsignaturas } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-menciones',
  templateUrl: './form-menciones.component.html',
  styles: [
  ]
})
export class FormMencionesComponent {

	@Input() dataExternal: DataExternal = { data: false };
	@Input() needShowAsignaturas: boolean = true;
	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();
	constructor(
		public form: FormMencionesService,
		public main: MencionesMainService,
		public table: TableMencionesService,
		public mainFacultades: FacultadesMainService
	){}
    
	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		this.form.needShowAsignaturas = this.needShowAsignaturas;
		this.dataExternal.data ? await this.setFormByExternalData() : this.initForm();
	}

	async ngOnChanges(changes: SimpleChanges) {
		if ( changes['dataExternal'] && changes['dataExternal'].currentValue.data ) {
			this.form.setDataExternal(this.dataExternal);
		}
	}

	ngOnDestroy(): void {
		this.form.needShowAsignaturas = true;
		this.main.showTable = false
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
		this.main.resetArraysWhenChangedDropdownPrograma();
		this.form.resetControlsWhenChangedDropdownPrograma();
		this.form.disabledControlsWhenChangedDropdownPrograma();
		this.form.cod_programa_selected = event.value;
		await this.main.getPlanesDeEstudiosPorPrograma();
	}

	async changePlanDeEstudio(event:any){
		this.main.resetArraysWhenChangedDropdownPlanEstudio();
		this.form.resetControlsWhenChangedDropdownPlanEstudio();
		this.form.disabledControlsWhenChangedDropdownPlanEstudio();
		this.clearTableAsignatura();
		this.form.cod_plan_estudio = event.value;
		await this.main.getAsignaturasMencionHabilitada();
	}

	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		  const control = this.form.fbForm.get(key);
		  if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		  }
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
		// console.log("VALORES COLORES:",this.form.arrowsColors);
		// console.log("ROW SELECTED PROGRAMA:",this.table.selectedProgramaRows);
		// console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}

	selectAsignatura(event: any){
		const parsedAsignaturas = parseAsignaturas(event, this.main.asignaturas)
		this.form.setAsignatura(parsedAsignaturas);
	}

	selectMenciones(event: any){
		this.form.setMenciones(event);
	}

	clearTableAsignatura(){
		this.table.resetSelectedRowsTableAsignaturas();
		this.form.setAsignatura([]);
	}

	clearTableMenciones(){
		this.table.resetSelectedRowsTableMenciones();
		this.form.setMenciones('');
	}

	nextStep() {
		switch (this.form.activeTab) {
			case 0:
				!this.needShowAsignaturas  ? (this.form.activeTab = 2) : (this.form.activeTab = 1)
			break;

			case 1:
				this.form.activeTab = 2
			break;
		}
	  }
	
	prevStep() {
		switch (this.form.activeTab) {
			case 2:
				!this.needShowAsignaturas ? (this.form.activeTab = 0) : (this.form.activeTab = 1)
			break;
	
			case 1:
				this.form.activeTab = 0
			break;	
		}
	}



}
