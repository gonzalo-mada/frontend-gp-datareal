import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormPrerrequisitosService } from 'src/app/project/services/asignaturas/prerrequisitos/form.service';
import { PrerrequisitosMainService } from 'src/app/project/services/asignaturas/prerrequisitos/main.service';
import { TablePrerrequisitosService } from 'src/app/project/services/asignaturas/prerrequisitos/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { parseAsignaturas } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-prerrequisitos',
  templateUrl: './form-prerrequisitos.component.html',
  styles: [
  ]
})
export class FormPrerrequisitosComponent implements OnInit, OnDestroy{

  @Input() dataExternal: DataExternal = { data: false };
  @Output() formWasClosed = new EventEmitter<boolean>();
  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormPrerrequisitosService,
    public main: PrerrequisitosMainService,
    public mainFacultad: FacultadesMainService,
    public table: TablePrerrequisitosService
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
    this.main.resetAndClearTables();
    this.form.resetControlsWhenChangedDropdownFacultadPostgrado();
    this.form.disabledControlsWhenChangedDropdownFacultadPostgrado();
    this.form.cod_facultad_selected_postgrado = event.value;
    await this.main.getProgramasPorFacultad();
  }

  async changeProgramaPostgrado(event:any){
    this.main.resetArraysWhenChangedDropdownPrograma();
    this.main.resetAndClearTables();
    this.form.resetControlsWhenChangedDropdownProgramaPostgrado();
    this.form.disabledControlsWhenChangedDropdownProgramaPostgrado();
    this.form.cod_programa_postgrado_selected = event.value;
    await this.main.getPlanesDeEstudiosPorPrograma();
  }

  async changePlanDeEstudio(event:any){
    this.form.cod_planestudio_selected = event.value;
		await this.main.getAsignaturasPrerrequisitoHabilitado();
		await this.main.getAsignaturasSimplificatedConTemaAgrupado(false,false);
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

  clearTableAsignatura(){
    this.table.selectedAsignaturaRows = {};
    this.form.setAsignatura([]);
	}

  clearTablePrerrequisito(){
    this.table.selectedPrerrequisitoRows = {};
    this.form.setPrerrequisito([]);
	}

  async selectAsignatura(event: any){
    if (this.form.modeForm === 'create') {
      this.clearTablePrerrequisito();
    }
    const parsedAsignaturas = parseAsignaturas(event, this.main.asignaturas_grouped)

		this.form.setAsignatura(parsedAsignaturas);
		this.form.setAsignaturaSelected(parsedAsignaturas.filteredResult);

    await this.main.filterTablePrerrequisitosPorAsignSelected();
    
	}

  selectPrerrequisito(event: any){
    const parsedAsignaturas = parseAsignaturas(event, this.main.prerrequisitos_grouped)
		this.form.setPrerrequisito(parsedAsignaturas);
	}


}
