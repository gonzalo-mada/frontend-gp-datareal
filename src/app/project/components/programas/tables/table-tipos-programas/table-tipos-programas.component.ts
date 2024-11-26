import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { TiposProgramasMainService } from 'src/app/project/services/programas/tipos-programas/main.service';
import { TableTiposProgramasService } from 'src/app/project/services/programas/tipos-programas/table.service';

@Component({
  selector: 'app-table-tipos-programas',
  templateUrl: './table-tipos-programas.component.html',
  styles: [
  ]
})
export class TableTiposProgramasComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;
  originalData: any[] = [];

  constructor(
    public main: TiposProgramasMainService, 
    public table: TableTiposProgramasService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getTiposProgramas(showCountTableValues);
    await this.main.getCategoriasTp();
    this.originalData = [...this.main.tiposProg];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: TipoPrograma){
    this.main.setModeCrud('edit',data);
  }

  show(data: TipoPrograma){
    this.main.setModeCrud('show',data);
  }

  delete(data: TipoPrograma){
    this.main.setModeCrud('delete',data);
  }

  changeState(data: TipoPrograma){
    this.main.setModeCrud('changeState',data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    this.main.tiposProg = [...this.originalData];
    table.reset();
  }

}
