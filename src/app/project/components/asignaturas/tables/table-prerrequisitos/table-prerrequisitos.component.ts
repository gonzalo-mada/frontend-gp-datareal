import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Prerrequisito } from 'src/app/project/models/asignaturas/Prerrequisito';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrerrequisitosMainService } from 'src/app/project/services/asignaturas/prerrequisitos/main.service';
import { TablePrerrequisitosService } from 'src/app/project/services/asignaturas/prerrequisitos/table.service';

@Component({
  selector: 'app-table-prerrequisitos',
  templateUrl: './table-prerrequisitos.component.html',
  styles: [
  ]
})
export class TablePrerrequisitosComponent implements OnInit, OnDestroy {

	@Input() mode: ModeForm;
	@Input() dataExternal: DataExternal = { data: false };
	private subscription: Subscription = new Subscription();
	
	searchValue: string | undefined;
	expandedRows = {};
  expandedRowsTemas = {};

  constructor(
    public main: PrerrequisitosMainService,
    public table: TablePrerrequisitosService
  ){}

  ngOnInit(): void {
		this.subscription.add(this.main.onActionToBD$.subscribe( () => this.getData(false)))
		if(this.dataExternal.data) this.setTable();
	}

	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

  async setTable(){
    this.main.setVarsNotFormByDataExternal(this.dataExternal)
    await this.getData(true);
  }

  async getData(showCountTableValues: boolean){
    await this.main.getAsignaturasConPrerrequisitos(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: Prerrequisito){
    this.main.setModeCrud('edit',data);
  }
  
  show(data: Prerrequisito){
    this.main.setModeCrud('show', data);
  }
  
  delete(data: Prerrequisito){
    this.main.setModeCrud('delete', data);
  }
  
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }
}
