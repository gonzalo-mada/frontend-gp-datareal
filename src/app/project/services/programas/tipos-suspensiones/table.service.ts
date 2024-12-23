import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Suspension } from 'src/app/project/models/programas/Suspension';

@Injectable({
    providedIn: 'root'
})

export class TableTiposSuspensionesService {

    cols : any[] = [
        { field: 'Descripcion_TipoSuspension', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_TipoSuspension' ];
    dataKeyTable : string = 'ID_TipoSuspension';
    selectedRows: Suspension[] = [];

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