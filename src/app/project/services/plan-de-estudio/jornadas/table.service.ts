import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';

@Injectable({
    providedIn: 'root'
})

export class TableJornadaService {

    cols: any[] = [
        { field: 'Descripcion_jornada', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];

    globalFiltros: any[] = ['Descripcion_jornada'];
    dataKeyTable: string = 'Cod_jornada';
    selectedRows: Jornada[] = [];

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