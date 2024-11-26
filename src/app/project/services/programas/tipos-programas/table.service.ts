import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';

@Injectable({
    providedIn: 'root'
})

export class TableTiposProgramasService {

    cols : any[] = [
        { field: 'Descripcion_tp', header: 'Nombre' },
        { field: 'Categoria.Descripcion_categoria', header: 'Categoría' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_tp', 'Categoria.Descripcion_categoria' ];
    dataKeyTable : string = 'Cod_tipoPrograma';
    selectedRows: TipoPrograma[] = [];

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