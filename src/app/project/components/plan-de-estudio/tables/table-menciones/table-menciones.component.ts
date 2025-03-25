import { Component, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
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
	@Input() from!: 'crud_asign' | 'crud_pe' | 'mantenedor' ;
	private subscription: Subscription = new Subscription();

	searchValue: string | undefined;
	expandedRows = {};
	showRowExpandAsignaturas: boolean = false;
	
	constructor(
		public main: MencionesMainService,
		public table: TableMencionesService
	){}

	async ngOnInit() {
		this.subscription.add(this.main.onActionToBD$.subscribe( () => this.getData(false)))
		this.main.openedFrom = this.from;
		this.dataExternal.data ? ( await this.setTable() ) : ( await this.getData(false) );
	}
	  
	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async setTable(){
		this.main.setVarsNotFormByDataExternal(this.dataExternal)
		await this.getData(true);
	}

	async getData(showCountTableValues: boolean){
		if (this.from !== 'crud_asign') {
			await this.main.getMencionesPorPlanDeEstudio(showCountTableValues);
			this.showRowExpandAsignaturas = true;
		}else{
			await this.main.getMencionesPorAsignatura(showCountTableValues);
			this.showRowExpandAsignaturas = false;

		}
		
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
