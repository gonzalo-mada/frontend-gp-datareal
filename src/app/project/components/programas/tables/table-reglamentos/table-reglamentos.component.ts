import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';
import { TableReglamentosService } from 'src/app/project/services/programas/reglamentos/table.service';

@Component({
  selector: 'app-table-reglamentos',
  templateUrl: './table-reglamentos.component.html',
  styles: [
  ]
})

export class TableReglamentosComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    public reglamentosMainService: ReglamentosMainService, 
    public tableReglamentosService: TableReglamentosService
  ){}


  async ngOnInit() {
    this.getReglamentos(true);
    this.subscription.add(this.tableReglamentosService.refreshTableReglamento$.subscribe( () => this.getReglamentos(false) ));
  }

  ngOnDestroy(): void {
    this.tableReglamentosService.resetSelectedRows();
  }

  async getReglamentos(showCountTableValues: boolean){
    await this.reglamentosMainService.getReglamentos(showCountTableValues);
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.tableReglamentosService.resetSelectedRows();
  }
  
  edit(data: Reglamento){
    this.reglamentosMainService.setModeCrud('edit',data);
  }
 
  show(data: Reglamento){
    this.reglamentosMainService.setModeCrud('show', data);
  }
 
  delete(data: Reglamento){
    this.reglamentosMainService.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.tableReglamentosService.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.reglamentosMainService.countTableValues();
  }
}