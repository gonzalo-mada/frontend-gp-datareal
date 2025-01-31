import { Component, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { TableMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/table.service';

@Component({
  selector: 'app-table-menciones',
  templateUrl: './table-menciones.component.html',
  styles: [
  ]
})
export class TableMencionesComponent {

	@Input() mode: ModeForm;
	@Input() dataExternal: DataExternal = { data: false };

	searchValue: string | undefined;
	expandedRows = {};
	
	constructor(
		public main: MencionesMainService,
		public table: TableMencionesService
	){}

	ngOnInit(): void {
		this.dataExternal.data ? ( this.setTable() ) : ( this.getData(true) );
	}
	  
	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async setTable(){
		this.main.setVarsNotFormByDataExternal(this.dataExternal)
		await this.getData(true);
	}

	async getData(showCountTableValues: boolean){
		if(this.main.menciones.length === 0) await this.main.getMencionesPorPlanDeEstudio(showCountTableValues)
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
