import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { TableMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/table.service';

@Component({
  selector: 'app-table-menciones',
  templateUrl: './table-menciones.component.html',
  styles: [
  ]
})
export class TableMencionesComponent {
	searchValue: string | undefined;
	expandedRows = {};
	
	constructor(
		public main: MencionesMainService,
		public table: TableMencionesService
	){}

	ngOnInit(): void {
		this.getData(true);
	}
	  
	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async getData(showCountTableValues: boolean){
		await this.main.getMencionesPorPlanDeEstudio(showCountTableValues)
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: Mencion){
		this.main.setModeCrud('edit',data);
	}
	 
	show(data: Mencion){
		this.main.setModeCrud('show', data);
	}
	 
	delete(data: Mencion){
		this.main.setModeCrud('delete', data);
	}
	   
	clear(table: Table){
		this.table.resetSelectedRows();
		this.searchValue = ''
		table.reset();
		this.main.countTableValues();
	}
}
