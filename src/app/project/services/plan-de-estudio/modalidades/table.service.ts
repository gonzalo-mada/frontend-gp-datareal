import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';

@Injectable({
    providedIn: 'root'
})
export class TableModalidadService {

    cols: any[] = [
        { field: 'Descripcion_modalidad', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];

    globalFiltros: any[] = ['Descripcion_modalidad'];
    dataKeyTable: string = 'Cod_modalidad';
    selectedRows: Modalidad[] = [];

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