import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { TableArticulacionesService } from 'src/app/project/services/plan-de-estudio/articulaciones/table.service';

@Component({
  selector: 'app-table-articulaciones',
  templateUrl: './table-articulaciones.component.html',
  styles: [
  ]
})
export class TableArticulacionesComponent implements OnInit, OnDestroy  {

  @Input() mode: ModeForm;
  @Input() dataFromAgregarPE: any = { data: false }
  @Input() from: string = '';
  
  searchValue: string | undefined;
  expandedRows = {};
  hideElements: boolean = false;

  constructor( 
    public main: ArticulacionesMainService,
    public table: TableArticulacionesService
  ){}

  ngOnInit(): void {
    this.dataFromAgregarPE.data ? (this.setTable() , this.hideElements = true) : ( this.getData(true) , this.hideElements = false);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async setTable(){
    this.main.cod_plan_estudio_selected_notform = this.dataFromAgregarPE.cod_plan_estudio;
    await this.getData(true);
  }

  async getData(showCountTableValues: boolean){
    await this.main.getArticulacionesPorPlanDeEstudio(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Articulacion){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: Articulacion){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: Articulacion){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
