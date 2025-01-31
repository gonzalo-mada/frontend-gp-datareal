import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { RangoAG } from 'src/app/project/models/plan-de-estudio/RangoAG';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';
import { TableRangosAGService } from 'src/app/project/services/plan-de-estudio/rangos-ag/table.service';

@Component({
  selector: 'app-table-rangos-ag',
  templateUrl: './table-rangos-ag.component.html',
  styles: [
  ]
})

export class TableRangosAgComponent implements OnInit, OnDestroy {

	@Input() mode: ModeForm;
	@Input() dataExternal: DataExternal = { data: false };

	searchValue: string | undefined;

	constructor(
		public main: RangosAGMainService,
		public table: TableRangosAGService
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

	async getData(showCountTableValues: boolean) {
		if(this.main.rangosAG.length === 0) await this.main.getRangosAprobacion(showCountTableValues);
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: RangoAG) {
		this.main.setModeCrud('edit', data);
	}

	show(data: RangoAG) {
		this.main.setModeCrud('show', data);
	}

	delete(data: RangoAG) {
		this.main.setModeCrud('delete', data);
	}

	clear(table: Table) {
		this.table.resetSelectedRows();
		this.searchValue = '';
		table.reset();
		this.main.countTableValues();
	}
}