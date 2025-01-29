import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { RangoAG } from 'src/app/project/models/plan-de-estudio/RangoAG';

@Injectable({
  providedIn: 'root'
})
export class TableRangosAGService {

	cols: any[] = [
		{ field: 'Descripcion_RangoAprobG', header: 'Nombre' },
		{ field: 'RexeReglamentoEstudio', header: 'REXE' },
		{ field: 'NotaMinima', header: 'Nota mínima' },
		{ field: 'NotaMaxima', header: 'Nota máxima' },
		{ field: 'accion', header: 'Acciones' }
	];

	globalFiltros: any[] = ['Descripcion_RangoAprobG','RexeReglamentoEstudio','NotaMinima','NotaMaxima'];
	dataKeyTable: string = 'Cod_RangoAprobG';
	selectedRows: RangoAG[] = [];

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