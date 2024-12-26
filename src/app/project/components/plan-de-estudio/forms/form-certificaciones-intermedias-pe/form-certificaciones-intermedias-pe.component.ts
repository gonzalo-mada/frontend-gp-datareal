import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormCertifIntermediasPEService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/form.service';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { TableCertifIntermediasPEService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-form-certificaciones-intermedias-pe',
  templateUrl: './form-certificaciones-intermedias-pe.component.html',
  styles: [
  ]
})
export class FormCertificacionesIntermediasPeComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();

	constructor(
		public form: FormCertifIntermediasPEService,
		public main: CertifIntermediasPEMainService,
		public table: TableCertifIntermediasPEService,
		public mainFacultad: FacultadesMainService
	){}
	
	async ngOnInit() {
		this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
		await this.mainFacultad.getFacultades(false);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
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
		console.log("ROW SELECTED PROGRAMA:",this.table.selectedCertifIntermediaRows);
		console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
		// this.form.getValuesSelected();
		// this.form.getValuesIndex();
	}

	async changeFacultadPostgrado(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownFacultad();
		this.form.resetFormWhenChangedDropdownFacultad();
		this.main.cod_facultad_selected_postgrado = event.value;
		if (this.main.showDropdownSelectProgramaPostgrado) this.main.showDropdownSelectProgramaPostgrado = false
		if (this.main.showDropdownSelectPlanEstudio) this.main.showDropdownSelectPlanEstudio = false
		if (this.main.showTables) this.main.showTables = false
		await this.main.getProgramasPostgradoConCertifIntermediaPorFacultad();
	}

	async changeProgramaPostgrado(event:any){
		this.table.resetSelectedRowsAllTables();
		this.main.resetArraysWhenChangedDropdownPrograma();
		this.form.resetFormWhenChangedDropdownPrograma();
		this.main.cod_programa_postgrado_selected = event.value;
		if (this.main.showDropdownSelectPlanEstudio) this.main.showDropdownSelectPlanEstudio = false
		if (this.main.showTables) this.main.showTables = false
		await this.main.getPlanesDeEstudiosPorPrograma();
		await this.main.getCertificacionIntermedia_Prog(false);
		this.main.showDropdownSelectPlanEstudio = true;
	}

	async changePlanDeEstudio(event:any){
		this.table.resetSelectedRowsTableAsignaturas();
		this.main.resetArraysWhenChangedDropdownPE();
		this.form.resetFormWhenChangedDropdownPE();
		this.main.cod_planestudio_selected = event.value;
		this.form.fbForm.patchValue({ Cod_plan_estudio: event.value });
		await this.main.getAsignaturasPorPlanDeEstudio();
	}

	selectCertificacionIntermedia(event: any){
		this.resetTableCertifIntermediaAndAsignaturas();
		this.table.selectedCertifIntermediaRows = {...event};
		this.form.fbForm.patchValue({ Cod_CertificacionIntermedia: event.Cod_CertificacionIntermedia });
	}

	selectAsignatura(event: any){
		this.form.fbForm.patchValue({ Asignaturas: event });
	}

	clearTableCertifIntermedia(){
		this.table.resetSelectedRowsTableCertifIntermedias();
		this.form.fbForm.patchValue({ Cod_CertificacionIntermedia: '' });
	}

	clearTableAsignatura(){
		this.table.resetSelectedRowsTableAsignaturas();
		this.form.fbForm.patchValue({ Asignaturas: '' });
	}

	resetTableCertifIntermediaAndAsignaturas(){
		this.table.resetSelectedRowsAllTables();
		this.form.fbForm.patchValue({ Cod_CertificacionIntermedia: '' });
		this.form.fbForm.patchValue({ Asignaturas: '' });
	}



}
