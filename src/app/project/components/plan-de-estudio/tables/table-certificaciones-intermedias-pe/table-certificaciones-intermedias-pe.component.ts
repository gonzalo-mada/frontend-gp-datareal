import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { CertifIntermediasPEMainService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/main.service';
import { TableCertifIntermediasPEService } from 'src/app/project/services/plan-de-estudio/certificaciones-intermedias-pe/table.service';

@Component({
  selector: 'app-table-certificaciones-intermedias-pe',
  templateUrl: './table-certificaciones-intermedias-pe.component.html',
  styles: [
  ]
})
export class TableCertificacionesIntermediasPeComponent {
	
	searchValue: string | undefined;
	expandedRows = {};

	constructor(
		public main: CertifIntermediasPEMainService,
		public table: TableCertifIntermediasPEService
	){}

	ngOnInit(): void {
		this.getData(true);
	}
	  
	ngOnDestroy(): void {
		this.table.resetSelectedRows();
	}

	async getData(showCountTableValues: boolean){
		await this.main.getCertificacionesIntermediasPorPlanDeEstudio(showCountTableValues)
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: CertificacionIntermediaPE){
		this.main.setModeCrud('edit',data);
	}
	 
	show(data: CertificacionIntermediaPE){
		this.main.setModeCrud('show', data);
	}
	 
	delete(data: CertificacionIntermediaPE){
		this.main.setModeCrud('delete', data);
	}
	   
	clear(table: Table){
		this.table.resetSelectedRows();
		this.searchValue = ''
		table.reset();
		this.main.countTableValues();
	}
}
