import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormCertifIntermediasPEService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/form.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { TableCertifIntermediasPEService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { parseAsignaturas } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-certificaciones-intermedias-pe',
  templateUrl: './form-certificaciones-intermedias-pe.component.html',
  styles: [
  ]
})
export class FormCertificacionesIntermediasPeComponent implements OnInit, OnDestroy {

	@Input() dataExternal: DataExternal = { data: false };
  	@Output() formWasClosed = new EventEmitter<boolean>();
	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormCertifIntermediasPEService,
		public main: CertifIntermediasPEMainService,
		public table: TableCertifIntermediasPEService,
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
		await Promise.all([
			await this.main.getProgramasPostgradoConCertifIntermediaPorFacultad(false),
			await this.main.getPlanesDeEstudiosPorPrograma(false),
			await this.main.getCertificacionIntermedia_Prog(false),
		]);
		await this.main.getAsignaturasSimplificatedConTemaAgrupado(false)
	}

	async initForm(){
		this.form.setDataExternal(this.dataExternal);
	}

	async submit(){
		this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
	}

	async changeFacultadPostgrado(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownFacultad();
		this.form.resetControlsWhenChangedDropdownFacultadPostgrado();
		this.form.disabledControlsWhenChangedDropdownFacultadPostgrado();
		this.form.cod_facultad_selected_postgrado = event.value;
		await this.main.getProgramasPostgradoConCertifIntermediaPorFacultad();
	}

	async changeProgramaPostgrado(event:any){
		this.table.resetSelectedRowsAllTables();
		this.main.resetArraysWhenChangedDropdownPrograma();
		this.form.resetControlsWhenChangedDropdownProgramaPostgrado();
		this.form.disabledControlsWhenChangedDropdownProgramaPostgrado();
		this.form.cod_programa_postgrado_selected = event.value;
		await this.main.getPlanesDeEstudiosPorPrograma();
		await this.main.getCertificacionIntermedia_Prog(false);
	}

	async changePlanDeEstudio(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownPE();
		this.form.resetFormWhenChangedDropdownPE();
		this.form.cod_planestudio_selected = event.value;
		await this.main.getAsignaturasSimplificatedConTemaAgrupado();
	}

	selectCertificacionIntermedia(event: any){
		this.resetTableCertifIntermediaAndAsignaturas();
		this.table.selectedCertifIntermediaRows = {...event};
		this.form.setCertificacionIntermedia(event);
	}

	selectAsignatura(event: any){
		const parsedAsignaturas = parseAsignaturas(event, this.main.asignaturas)
		this.form.setAsignaturas(parsedAsignaturas);
	}

	clearTableCertifIntermedia(){
		this.table.resetSelectedRowsTableCertifIntermedias();
		this.form.setCertificacionIntermedia('');
	}

	clearTableAsignatura(){
		this.table.resetSelectedRowsTableAsignaturas();
		this.form.setAsignaturas([]);
	}

	resetTableCertifIntermediaAndAsignaturas(){
		this.table.resetSelectedRowsTableCertifIntermedias();
		this.form.setCertificacionIntermedia('');
	}

	test(){
		Object.keys(this.form.fbForm.controls).forEach(key => {
		  const control = this.form.fbForm.get(key);
		  if (control?.invalid) {
			console.log(`Errores en ${key}:`, control.errors);
		  }
		});
		console.log("VALORES FORMULARIO:",this.form.fbForm.value);
		console.log("ROW SELECTED PROGRAMA:",this.table.selectedCertifIntermediaRows);
		console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}



}
