import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';
import { AsignaturasPlancomunMainService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/main.service';
import { TableAsignaturasPlancomunService } from 'src/app/project/services/plan-de-estudio/asignaturas-plancomun/table.service';

@Component({
  selector: 'app-table-asignaturas-plancomun',
  templateUrl: './table-asignaturas-plancomun.component.html',
  styles: [
  ]
})
export class TableAsignaturasPlancomunComponent {

	searchValue: string | undefined;
	expandedRows = {};
	
	constructor(
		public main: AsignaturasPlancomunMainService,
		public table: TableAsignaturasPlancomunService
	){}

	ngOnInit(): void {
		this.getData(true);
	}
	  
	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async getData(showCountTableValues: boolean){
		await this.main.getPlanesDeEstudiosConPlanComun(showCountTableValues)
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
