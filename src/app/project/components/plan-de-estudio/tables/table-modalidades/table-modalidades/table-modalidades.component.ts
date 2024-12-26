import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { ModalidadMainService } from 'src/app/project/services/plan-de-estudio/modalidades/main.service';
import { TableModalidadService } from 'src/app/project/services/plan-de-estudio/modalidades/table.service';

@Component({
  selector: 'app-table-modalidades',
  templateUrl: './table-modalidades.component.html',
  styles: []
})
export class TableModalidadesComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;
  originalData: any[] = [];


  constructor(
    public main: ModalidadMainService,
    public table: TableModalidadService
  ) {}

  ngOnInit(): void {
    this.getData(true);
  }
  
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean) {
    await this.main.getModalidades(showCountTableValues);
    this.originalData = [...this.main.modalidades];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Modalidad) {
    this.main.setModeCrud('edit', data);
  }

  show(data: Modalidad) {
    this.main.setModeCrud('show', data);
  }

  delete(data: Modalidad) {
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table) {
    this.table.resetSelectedRows();
    this.searchValue = '';
    this.main.modalidades = [...this.originalData];
    table.reset();
  }
}
