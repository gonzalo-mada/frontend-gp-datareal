import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
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
	@Input() dataExternal: DataExternal = { data: false };
	private subscription: Subscription = new Subscription();
	
	searchValue: string | undefined;
	expandedRows = {};

	constructor( 
		public main: ArticulacionesMainService,
		public table: TableArticulacionesService
	){}

	ngOnInit(): void {
		this.subscription.add(this.main.onActionToBD$.subscribe( () => this.getData(false)))
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
