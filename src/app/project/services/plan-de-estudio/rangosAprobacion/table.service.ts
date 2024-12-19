import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { RangosAG } from 'src/app/project/models/plan-de-estudio/RangosAG';

@Injectable({
  providedIn: 'root'
})
export class TableRangosAGService {

  cols: any[] = [
    { field: 'Descripcion_RangoAprobG', header: 'Nombre' },
    { field: 'NotaMinima', header: 'Nota mínima' },
    { field: 'NotaMaxima', header: 'Nota máxima' },
    { field: 'RexeReglamentoEstudio', header: 'Rexe plan de estudio' },

    { field: 'accion', header: 'Acciones' }
  ];

  globalFiltros: any[] = ['Descripcion_RangoAprobG'];
  dataKeyTable: string = 'Cod_modalidad';
  selectedRows: RangosAG[] = [];

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
