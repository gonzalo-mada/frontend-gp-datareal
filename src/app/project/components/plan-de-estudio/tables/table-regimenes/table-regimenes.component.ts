import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Regimen } from 'src/app/project/models/plan-de-estudio/Regimen';
import { RegimenMainService } from 'src/app/project/services/plan-de-estudio/regimen/main.service';
import { TableRegimenService } from 'src/app/project/services/plan-de-estudio/regimen/table.service';

@Component({
  selector: 'app-table-regimenes',
  templateUrl: './table-regimenes.component.html',
  styles: []
})
export class TableRegimenesComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  originalData: any[] = [];

  constructor(
    public main: RegimenMainService,
    public table: TableRegimenService
  ) {}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean) {
    await this.main.getRegimenes(showCountTableValues);
    this.originalData = [...this.main.regimenes];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Regimen) {
    this.main.setModeCrud('edit', data);
  }

  show(data: Regimen) {
    this.main.setModeCrud('show', data);
  }

  delete(data: Regimen) {
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table) {
    this.table.resetSelectedRows();
    this.searchValue = '';
    this.main.regimenes = [...this.originalData];
    table.reset();
  }
}