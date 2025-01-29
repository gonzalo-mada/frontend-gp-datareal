import { Injectable } from '@angular/core';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { TableCrudService } from '../../components/table-crud.service';

@Injectable({
    providedIn: 'root'
})

export class TableTemasService {


    cols : any[] = [
        { field: 'nombre_mencion', header: 'Nombre' },
        { field: 'descripcion_mencion', header: 'Título' },
        { field: 'vigencia', header: 'Vigencia' },
        { field: 'Acciones', header: 'Acciones' },
    ];
    globalFiltros : any[] = [ 'nombre_mencion', 'descripcion_mencion' ];
    dataKeyTable : string = 'cod_mencion';
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