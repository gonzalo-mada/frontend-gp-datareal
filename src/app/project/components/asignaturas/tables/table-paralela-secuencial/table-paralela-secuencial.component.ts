import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ParalelaSecuencial } from 'src/app/project/models/asignaturas/ParalelaSecuencial';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { ParalelaSecuencialMainService } from 'src/app/project/services/asignaturas/paralela-secuencial/main.service';
import { TableParalelaSecuencialService } from 'src/app/project/services/asignaturas/paralela-secuencial/table.service';

@Component({
  selector: 'app-table-paralela-secuencial',
  templateUrl: './table-paralela-secuencial.component.html',
  styles: [
  ]
})
export class TableParalelaSecuencialComponent implements OnInit, OnDestroy {
	@Input() mode: ModeForm;
	@Input() dataExternal: DataExternal = { data: false };
	private subscription: Subscription = new Subscription();
	
	searchValue: string | undefined;
	expandedRows = {};
  expandedRowsTemas = {};

  constructor(
    public main: ParalelaSecuencialMainService,
    public table: TableParalelaSecuencialService
  ){}

  ngOnInit(): void {
		this.subscription.add(this.main.onActionToBD$.subscribe( () => this.getData(false)))
		if(this.dataExternal.data) this.setTable();
	}

	ngOnDestroy(): void {
    this.subscription.unsubscribe();
		this.table.resetSelectedRows();
	}

  async setTable(){
    this.main.setVarsNotFormByDataExternal(this.dataExternal)
    await this.getData(true);
  }

  async getData(showCountTableValues: boolean){
    await this.main.getAsignaturasSecuencialesParalelasGroupedNotForm(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: ParalelaSecuencial){
    this.main.setModeCrud('edit',data);
  }
  
  show(data: ParalelaSecuencial){
    this.main.setModeCrud('show', data);
  }
  
  delete(data: ParalelaSecuencial){
    this.main.setModeCrud('delete', data);
  }
  
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
