import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Campus } from 'src/app/project/models/programas/Campus';

@Injectable({
    providedIn: 'root'
})

export class TableCampusService {

    cols : any[] = [
        { field: 'Descripcion_campus', header: 'Nombre' },
        { field: 'Estado_campus', header: 'Estado' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_campus' ];
    dataKeyTable : string = 'Cod_campus';
    selectedRows: Campus[] = [];

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