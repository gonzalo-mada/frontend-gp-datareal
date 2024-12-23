import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { TableArticulacionesService } from 'src/app/project/services/plan-de-estudio/articulaciones/table.service';

@Component({
  selector: 'app-table-articulaciones',
  templateUrl: './table-articulaciones.component.html',
  styles: [
  ]
})
export class TableArticulacionesComponent implements OnInit, OnDestroy  {

  searchValue: string | undefined;
  expandedRows = {};

  constructor( 
    public main: ArticulacionesMainService,
    public table: TableArticulacionesService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getArticulaciones(showCountTableValues);
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
