import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';

@Injectable({
    providedIn: 'root'
})

export class TableTiposGraduacionesService {

    cols : any[] = [
        { field: 'Descripcion_tipoColaborativa', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_tipoColaborativa' ];
    dataKeyTable : string = 'Cod_TipoColaborativa';
    selectedRows: TipoGraduacion[] = [];

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }

    emitResetExpandedRows(){
        this.tableCrudService.emitResetExpandedRowsTable();
    }

}