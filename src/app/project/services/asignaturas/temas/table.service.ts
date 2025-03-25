import { Injectable } from '@angular/core';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { TableCrudService } from '../../components/table-crud.service';

@Injectable({
    providedIn: 'root'
})

export class TableTemasService {

    cols : any[] = [
        { field: 'nombre_tema', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' },
    ];
    globalFiltros : any[] = [ 'nombre_tema' ];
    dataKeyTable : string = 'cod_tema';
    selectedRows: Tema[] = [];

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