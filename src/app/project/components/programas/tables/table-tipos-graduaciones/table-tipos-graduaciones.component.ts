import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';
import { TableTiposGraduacionesService } from 'src/app/project/services/programas/tipos-graduaciones/table.service';

@Component({
  selector: 'app-table-tipos-graduaciones',
  templateUrl: './table-tipos-graduaciones.component.html',
  styles: [
  ]
})
export class TableTiposGraduacionesComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;

  constructor( 
    public main: TiposGraduacionesMainService,
    public table: TableTiposGraduacionesService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getTiposGraduaciones(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: TipoGraduacion){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: TipoGraduacion){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: TipoGraduacion){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
