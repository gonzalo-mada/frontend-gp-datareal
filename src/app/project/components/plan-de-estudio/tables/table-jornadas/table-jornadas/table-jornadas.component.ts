import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { JornadaMainService } from 'src/app/project/services/plan-de-estudio/jornadas/main.service';
import { TableJornadaService } from 'src/app/project/services/plan-de-estudio/jornadas/table.service';

@Component({
  selector: 'app-table-jornadas',
  templateUrl: './table-jornadas.component.html',
  styles: []
})
export class TableJornadasComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;
  originalData: any[] = [];

  constructor( 
    public main: JornadaMainService,
    public table: TableJornadaService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean) {
    await this.main.getJornadas(showCountTableValues);
    this.originalData = [...this.main.jornadas];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Jornada) {
    this.main.setModeCrud('edit', data);
  }

  show(data: Jornada) {
    this.main.setModeCrud('show', data);
  }

  delete(data: Jornada) {
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table) {
    this.table.resetSelectedRows();
    this.searchValue = '';
    this.main.jornadas = [...this.originalData];
    table.reset();
  }
}