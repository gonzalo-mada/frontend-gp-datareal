import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { UnidadesAcadMainService } from 'src/app/project/services/programas/unidades-academicas/main.service';
import { TableUnidadesAcadService } from 'src/app/project/services/programas/unidades-academicas/table.service';

@Component({
  selector: 'app-table-unidades-academicas',
  templateUrl: './table-unidades-academicas.component.html',
  styles: [
  ]
})
export class TableUnidadesAcademicasComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  originalData: any[] = [];

  constructor(
    public main: UnidadesAcadMainService, 
    public table: TableUnidadesAcadService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getUnidadesAcademicas(showCountTableValues);
    await this.main.getFacultades();
    this.originalData = [...this.main.unidadesAcad];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: UnidadAcademica){
    this.main.setModeCrud('edit',data);
  }

  show(data: UnidadAcademica){
    this.main.setModeCrud('show',data);
  }

  delete(data: UnidadAcademica){
    this.main.setModeCrud('delete',data);
  }

  changeState(data: UnidadAcademica){
    this.main.setModeCrud('changeState',data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    this.main.unidadesAcad = [...this.originalData];
    table.reset();
  }

}
