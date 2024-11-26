import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Facultad } from 'src/app/project/models/programas/Facultad';

@Injectable({
    providedIn: 'root'
})

export class TableFacultadesService {

    cols : any[] = [
        { field: 'Descripcion_facu', header: 'Nombre' },
        { field: 'Estado_facu', header: 'Estado' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_facu' ];
    dataKeyTable : string = 'Cod_facultad';
    selectedRows: Facultad[] = [];

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