import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Facultad } from 'src/app/project/models/programas/Facultad';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { TableFacultadesService } from 'src/app/project/services/programas/facultad/table.service';

@Component({
  selector: 'app-table-facultad',
  templateUrl: './table-facultad.component.html',
  styles: [
  ]
})
export class TableFacultadComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;

  constructor(
    public main: FacultadesMainService, 
    public table: TableFacultadesService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getFacultades(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Facultad){
    this.main.setModeCrud('edit',data);
  }

  show(data: Facultad){
    this.main.setModeCrud('show',data);
  }

  delete(data: Facultad){
    this.main.setModeCrud('delete',data);
  }

  changeState(data: Facultad){
    this.main.setModeCrud('changeState',data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
