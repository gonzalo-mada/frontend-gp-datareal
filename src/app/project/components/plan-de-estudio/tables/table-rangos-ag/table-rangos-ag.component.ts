import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { RangosAG } from 'src/app/project/models/plan-de-estudio/RangosAG';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangosAprobacion/main.service';
import { TableRangosAGService } from 'src/app/project/services/plan-de-estudio/rangosAprobacion/table.service';

@Component({
  selector: 'app-table-rangos-ag',
  templateUrl: './table-rangos-ag.component.html',
  styles: [
  ]
})

export class TableRangosAgComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  originalData: any[] = [];

  constructor(
    public main: RangosAGMainService,
    public table: TableRangosAGService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean) {
    await this.main.getRangosAprobacion(showCountTableValues);
    console.log('Rangos recibidos:', this.main.rangosAG); //no se trae el cod_regimen

    this.originalData = [...this.main.rangosAG];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: RangosAG) {
    this.main.setModeCrud('edit', data);
  }

  show(data: RangosAG) {
    this.main.setModeCrud('show', data);
  }

  delete(data: RangosAG) {
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table) {
    this.table.resetSelectedRows();
    this.searchValue = '';
    this.main.rangosAG = [...this.originalData];
    table.reset();
  }
}
