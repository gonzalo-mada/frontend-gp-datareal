import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { ParalelaSecuencial } from 'src/app/project/models/asignaturas/ParalelaSecuencial';

@Injectable({
  providedIn: 'root'
})
export class TableParalelaSecuencialService {

	cols: any[] = [
		{ field: 'nombre_asignatura_completa', header: 'Asignatura' },
		{ field: 'secuencialidad', header: 'Paralela / Secuencial' },
		{ field: 'semestre', header: 'Semestre' },
		{ field: 'accion', header: 'Acciones' }
	];

	cols_asignatura: any[] = [
		{ field: 'nombre_asignatura_completa', header: 'Asignatura' , width: '80%' , text_center: false },
		{ field: 'semestre', header: 'Semestre', width: '20%' , text_center: true }
	]

	globalFiltros: any[] = ['nombre_asignatura_completa'];
	dataKeyTable: string = 'cod_asignatura';
	selectedRows: ParalelaSecuencial[] = [];
	selectedAsignaturaRows: any = {};
	selectedParalelaSecuencialRows: any = {};

  	constructor(private tableCrudService: TableCrudService) {}

	setSelectedRows() {
		this.tableCrudService.setSelectedRows(this.selectedRows);
	}

	resetSelectedRows() {
		this.selectedRows = [];
		this.setSelectedRows();
	}

	emitResetExpandedRows() {
		this.tableCrudService.emitResetExpandedRowsTable();
	}
}