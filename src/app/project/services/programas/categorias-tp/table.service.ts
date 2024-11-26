import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';

@Injectable({
    providedIn: 'root'
})

export class TableCategoriasTpService {

    cols : any[] = [
        { field: 'Descripcion_categoria', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_categoria' ];
    dataKeyTable : string = 'Cod_CategoriaTP';
    selectedRows: CategoriaTp[] = [];

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