import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
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
export class FormArticulacionesComponent implements OnInit, OnDestroy  {


  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormArticulacionesService,
    public main: ArticulacionesMainService,
    public table: TableArticulacionesService,
    public mainFacultad: FacultadesMainService
  ){}

  async ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
    await this.main.getPlanesDeEstudios(false);
    await this.mainFacultad.getFacultades(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

  changePlanDeEstudio(event:any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.form.fbForm.get('Cod_Facultad_Selected')?.reset();
    if (this.main.showTables) this.main.showTables = false
    this.main.showDropdownSelectFacultad = true;
    this.form.cod_planDeEstudio_selected = event.value;
  }

  async changeFacultad(event: any){
    this.table.resetSelectedRowsAllTables();
    this.clearArraysDataTable();
    this.main.cod_facultad_selected = event.value;
    await this.main.getProgramasPregradoPorFacultad();
    this.form.fbForm.get('Cod_programa_pregrado')?.enable();
    this.main.showTables = true
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
    this.main.cod_programa_selected = event.codPrograma;
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



}
