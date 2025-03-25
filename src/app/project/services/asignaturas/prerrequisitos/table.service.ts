import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Prerrequisito } from 'src/app/project/models/asignaturas/Prerrequisito';

@Injectable({
  providedIn: 'root'
})
export class TablePrerrequisitosService {

	cols: any[] = [
		{ field: 'nombre_asignatura_completa', header: 'Asignatura' },
		{ field: 'num_prerrequisitos', header: 'Número de prerrequisitos' },
		{ field: 'accion', header: 'Acciones' }
	];

	cols_asignatura: any[] = [
		{ field: 'nombre_asignatura_completa', header: 'Asignatura' }
	]

	globalFiltros: any[] = ['nombre_asignatura_completa'];
	dataKeyTable: string = 'cod_asignatura';
	selectedRows: Prerrequisito[] = [];
	selectedAsignaturaRows: any = {};
	selectedPrerrequisitoRows: any = {};

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