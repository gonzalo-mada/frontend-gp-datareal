import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class FormArticulacionesComponent implements OnInit, OnChanges, OnDestroy  {

  @Input() dataFromAgregarPE: any = { data: false };
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
    this.dataFromAgregarPE.data ? await this.setFormByAgregarPE() : this.initForm();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ( changes['dataFromAgregarPE'] && changes['dataFromAgregarPE'].currentValue.data && changes['dataFromAgregarPE'].currentValue.show) {
      await this.setFormByAgregarPE()
    }else{
      await this.initForm()
    }
  }

  ngOnDestroy(): void {
    this.main.showTable = false
    this.subscription.unsubscribe();
  }

  async setFormByAgregarPE(){
    console.log("ejecuté setFormByAgregarPE");
    
    this.form.setValuesVarsByAgregarPE(this.dataFromAgregarPE);
    this.main.cod_plan_estudio_selected_notform = this.dataFromAgregarPE.cod_plan_estudio;
    await Promise.all([
      this.main.getProgramasPorFacultad(false),
      this.main.getPlanesDeEstudiosPorPrograma(false),
      this.mainFacultad.getFacultades(false)
    ]);
    this.form.setControlsFormByAgregarPE(this.dataFromAgregarPE);
    this.form.setDropdowns();
    this.main.wasFilteredTable = true;
  }

  async initForm(){
    await this.mainFacultad.getFacultades(false);
    this.form.showDropdownSelectFacultadPostgrado = true;
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

  async changeFacultadPostgrado(event:any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.form.fbForm.get('Cod_Programa_Postgrado_Selected')?.reset();
    this.form.fbForm.get('Cod_plan_estudio')?.reset();
    this.form.fbForm.get('Cod_Facultad_Selected')?.reset();
    this.form.cod_facultad_selected_postgrado = event.value;
    if (this.form.showDropdownSelectProgramaPostgrado) this.form.showDropdownSelectProgramaPostgrado = false
    if (this.form.showDropdownSelectPlanEstudio) this.form.showDropdownSelectPlanEstudio = false
    if (this.form.showDropdownSelectFacultad) this.form.showDropdownSelectFacultad = false
    if (this.form.showTables) this.form.showTables = false
    await this.main.getProgramasPorFacultad();
  }

  async changeProgramaPostgrado(event:any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.form.fbForm.get('Cod_plan_estudio')?.reset();
    this.form.fbForm.get('Cod_Facultad_Selected')?.reset();
    this.form.cod_programa_postgrado_selected = event.value;
    if (this.form.showDropdownSelectPlanEstudio) this.form.showDropdownSelectPlanEstudio = false
    if (this.form.showDropdownSelectFacultad) this.form.showDropdownSelectFacultad = false
    if (this.form.showTables) this.form.showTables = false
    await this.main.getPlanesDeEstudiosPorPrograma();
  }

  changePlanDeEstudio(event:any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.form.fbForm.get('Cod_Facultad_Selected')?.reset();
    if (this.form.showTables) this.form.showTables = false
    this.form.showDropdownSelectFacultad = true;
    this.form.cod_plan_estudio_selected = event.value;
  }

  async changeFacultad(event: any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.form.cod_facultad_selected_pregrado = event.value;
    await this.main.getProgramasPregradoPorFacultad();
    this.form.fbForm.get('Cod_programa_pregrado')?.enable();
    this.form.showTables = true
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
    console.log("VALORES FORMULARIO:",this.form.fbForm.value);
    console.log("ROW SELECTED PROGRAMA:",this.table.selectedProgramaRows);
    console.log("ROWS SELECTED ASIGNATURAS:",this.table.selectedAsignaturaRows);
    // this.form.getValuesSelected();
    // this.form.getValuesIndex();
  }

  async selectPrograma(event: any){
    this.resetTableProgramaAndAsignatura();
    this.table.selectedProgramaRows = {...event}
    this.form.cod_programa_selected = event.codPrograma;
    await this.main.getAsignaturasPorProgramaPregrado();
    this.form.fbForm.patchValue({ Cod_programa_pregrado: event.codPrograma });
    this.form.fbForm.patchValue({ Descripcion_programa_pregrado: event.nombreCarrera });
  }

  selectAsignatura(event: any){
    this.form.fbForm.patchValue({ Asignaturas: event });
  }

  clearTablePrograma(){
    this.table.resetSelectedRowsAllTables();
    this.form.fbForm.patchValue({ Cod_programa_pregrado: '' });
    this.form.fbForm.patchValue({ Descripcion_programa_pregrado: '' });
    this.clearTableAsignatura();
    this.main.asignaturas = [];
  }

  clearTableAsignatura(){
    this.table.resetSelectedRowsTableAsignaturas();
    this.form.fbForm.patchValue({ Asignaturas: '' });
  }

  resetTableProgramaAndAsignatura(){
    this.table.resetSelectedRowsAllTables();
    this.form.fbForm.patchValue({ Cod_programa_pregrado: '' });
    this.form.fbForm.patchValue({ Descripcion_programa_pregrado: '' });
    this.form.fbForm.patchValue({ Asignaturas: '' });
  }

  clearArraysDataTable(){
    this.main.asignaturas = [];
    this.main.programas = [];
  }

  formClosed(){
    this.formWasClosed.emit();
  }


}
