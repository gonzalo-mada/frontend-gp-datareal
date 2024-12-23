import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Campus } from 'src/app/project/models/programas/Campus';
import { CampusMainService } from 'src/app/project/services/programas/campus/main.service';
import { TableCampusService } from 'src/app/project/services/programas/campus/table.service';

@Component({
  selector: 'app-table-campus',
  templateUrl: './table-campus.component.html',
  styles: [
  ]
})
export class TableCampusComponent implements OnInit, OnDestroy {
  
  searchValue: string | undefined;

  constructor(
    public main: CampusMainService, 
    public table: TableCampusService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getCampus(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Campus){
    this.main.setModeCrud('edit',data);
  }

  show(data: Campus){
    this.main.setModeCrud('show',data);
  }

  delete(data: Campus){
    this.main.setModeCrud('delete',data);
  }

  changeState(data: Campus){
    this.main.setModeCrud('changeState',data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
