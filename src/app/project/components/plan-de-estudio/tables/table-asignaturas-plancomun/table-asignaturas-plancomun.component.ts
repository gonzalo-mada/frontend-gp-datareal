import { Component, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { AsignaturasPlancomunMainService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/main.service';
import { TableAsignaturasPlancomunService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/table.service';

@Component({
  selector: 'app-table-asignaturas-plancomun',
  templateUrl: './table-asignaturas-plancomun.component.html',
  styles: [
  ]
})
export class TableAsignaturasPlancomunComponent {

	@Input() mode: ModeForm;
	@Input() dataExternal: DataExternal = { data: false };
	private subscription: Subscription = new Subscription();

	searchValue: string | undefined;
	expandedRows = {};
	
	constructor(
		public main: AsignaturasPlancomunMainService,
		public table: TableAsignaturasPlancomunService
	){}

	ngOnInit(): void {
		this.subscription.add(this.main.onInsertedData$.subscribe( () => this.getData(false)))
		this.dataExternal.data ? ( this.setTable() ) : ( this.getData(false) );
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
		await this.main.getAsignaturasPCPorPlanDeEstudio(showCountTableValues)
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: AsignaturasPlancomun){
		this.main.setModeCrud('edit',data);
	}
	 
	show(data: AsignaturasPlancomun){
		this.main.setModeCrud('show', data);
	}
	 
	delete(data: AsignaturasPlancomun){
		this.main.setModeCrud('delete', data);
	}
	   
	clear(table: Table){
		this.table.resetSelectedRows();
		this.searchValue = ''
		table.reset();
		this.main.countTableValues();
	}
}
