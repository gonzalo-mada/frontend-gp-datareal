import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Campus } from 'src/app/project/models/programas/Campus';

@Injectable({
    providedIn: 'root'
})

export class TableCampusService {

    cols : any[] = [
        { field: 'descripcionCampus', header: 'Nombre' },
        { field: 'estadoCampus', header: 'Estado' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'descripcionCampus' ];
    dataKeyTable : string = 'codigoCampus';
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