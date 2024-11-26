import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';
import { TableTiposSuspensionesService } from 'src/app/project/services/programas/tipos-suspensiones/table.service';

@Component({
  selector: 'app-table-suspensiones',
  templateUrl: './table-suspensiones.component.html',
  styles: [
  ]
})
export class TableSuspensionesComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  originalData: any[] = [];

  constructor( 
    public main: TiposSuspensionesMainService,
    public table: TableTiposSuspensionesService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getTiposSuspensiones(showCountTableValues);
    this.originalData = [...this.main.tipos_susp];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Suspension){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: Suspension){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: Suspension){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    this.main.tipos_susp = [...this.originalData];
    table.reset();
  }

}
