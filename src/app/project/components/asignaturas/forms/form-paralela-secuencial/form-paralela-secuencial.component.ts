import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormParalelaSecuencialService } from 'src/app/project/services/asignaturas/paralela-secuencial/form.service';
import { ParalelaSecuencialMainService } from 'src/app/project/services/asignaturas/paralela-secuencial/main.service';
import { TableParalelaSecuencialService } from 'src/app/project/services/asignaturas/paralela-secuencial/table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { parseAsignaturas } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-paralela-secuencial',
  templateUrl: './form-paralela-secuencial.component.html',
  styles: [
  ]
})
export class FormParalelaSecuencialComponent implements OnInit, OnDestroy {

  @Input() dataExternal: DataExternal = { data: false };
  @Input() from!: 'crud_asign' | 'mantenedor' ;
  @Output() formWasClosed = new EventEmitter<boolean>();
  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormParalelaSecuencialService,
    public main: ParalelaSecuencialMainService,
    public mainFacultad: FacultadesMainService,
    public table: TableParalelaSecuencialService
  ){}

  async ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm;}));
    this.main.openedFrom = this.from;
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
    this.main.resetArraysWhenChangedDropdownPlanDeEstudio();
    this.main.resetAndClearTables();
    this.form.resetControlsWhenChangedDropdownPlanDeEstudio();
    this.form.disabledControlsWhenChangedDropdownPlanDeEstudio();
    this.form.cod_planestudio_selected = event.value;
    this.form.setStatusControlParalelaSecuencial(true);
  }

  async changeParalelaSecuencial(event: any){
    this.main.resetAndClearTables();
    this.form.cod_paralela_secuencial_selected = event.value;
		await this.main.getAsignaturasParalelaSecuencial();    
		await this.main.getAsignaturasParalelaSecuencialNotFiltered();    
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

  clearTableParalelaSecuencial(){
    this.table.selectedParalelaSecuencialRows = {};
    this.form.setParalelaSecuencial([]);
	}

  selectAsignatura(event: any){
    if (this.form.modeForm === 'create') {
      this.clearTableParalelaSecuencial();
    }
    const parsedAsignaturas = parseAsignaturas(event, this.main.asignaturas_grouped)

		this.form.setAsignatura(parsedAsignaturas);
		this.form.setAsignaturaSelected(parsedAsignaturas.filteredResult);

    this.main.filterTableSecuencialidadParalelidadPorAsignSelected('selectAsignatura');
    
	}

  selectParalelaSecuencial(event: any){
    const parsedAsignaturas = parseAsignaturas(event, this.main.asign_sec_par)
		this.form.setParalelaSecuencial(parsedAsignaturas);
	}

}
