import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Regimen } from 'src/app/project/models/plan-de-estudio/Regimen';

@Injectable({
    providedIn: 'root'
})
export class TableRegimenService {

    cols: any[] = [
        { field: 'Descripcion_regimen', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];

    globalFiltros: any[] = ['Descripcion_regimen'];
    dataKeyTable: string = 'Cod_regimen';
    selectedRows: Regimen[] = [];

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
