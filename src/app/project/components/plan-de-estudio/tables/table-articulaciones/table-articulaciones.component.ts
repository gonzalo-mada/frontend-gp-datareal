import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { TableArticulacionesService } from 'src/app/project/services/plan-de-estudio/articulaciones/table.service';

@Component({
  selector: 'app-table-articulaciones',
  templateUrl: './table-articulaciones.component.html',
  styles: [
  ]
})
export class TableArticulacionesComponent implements OnInit, OnDestroy  {

	@Input() mode: ModeForm;
	@Input() dataExternal: any = { data: false }
	@Input() from: string = '';
	
	searchValue: string | undefined;
	expandedRows = {};

	constructor( 
		public main: ArticulacionesMainService,
		public table: TableArticulacionesService
	){}

	ngOnInit(): void {
		this.dataExternal.data ? ( this.setTable() ) : ( this.getData(true) );
	}

	// async ngOnChanges(changes: SimpleChanges) {
	// 	console.log("changes['dataExternal']",changes['dataExternal']);
		
	// 	if ( changes['dataExternal'] && changes['dataExternal'].currentValue.data) {
	// 		console.log("estoy aca 1 table articulaciones");
			
	// 		await this.setTable()
	// 	}else{
	// 		console.log("estoy aca 2 table articulaciones");

	// 		await this.getData(true)
	// 	}
	// }

	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async setTable(){
		this.main.cod_plan_estudio_selected_notform = this.dataExternal.cod_plan_estudio;
		await this.getData(true);
	}

	async getData(showCountTableValues: boolean){
		await this.main.getArticulacionesPorPlanDeEstudio(showCountTableValues);
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: Articulacion){
		this.main.setModeCrud('edit',data);
	}
	
	show(data: Articulacion){
		this.main.setModeCrud('show', data);
	}
	
	delete(data: Articulacion){
		this.main.setModeCrud('delete', data);
	}
	
	clear(table: Table){
		this.table.resetSelectedRows();
		this.searchValue = ''
		table.reset();
		this.main.countTableValues();
	}

}
