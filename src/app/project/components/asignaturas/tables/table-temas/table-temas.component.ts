import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { TemasMainService } from 'src/app/project/services/asignaturas/temas/main.service';
import { TableTemasService } from 'src/app/project/services/asignaturas/temas/table.service';

@Component({
  selector: 'app-table-temas',
  templateUrl: './table-temas.component.html',
  styles: [
  ]
})
export class TableTemasComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();
	searchValue: string | undefined;

  constructor(
    public main: TemasMainService,
    public table: TableTemasService
  ){}

  ngOnInit(): void {
		this.subscription.add(this.main.onActionToBD$.subscribe( () => this.getData(false)))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getTemasPorProgramaNotForm(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Tema){
    this.main.setModeCrud('edit',data);
  }
  
  show(data: Tema){
    this.main.setModeCrud('show', data);
  }
  
  delete(data: Tema){
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
