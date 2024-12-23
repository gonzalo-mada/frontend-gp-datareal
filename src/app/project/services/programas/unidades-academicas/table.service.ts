import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';

@Injectable({
    providedIn: 'root'
})

export class TableUnidadesAcadService {

    cols : any[] = [
        { field: 'Descripcion_ua', header: 'Nombre' },
        { field: 'Facultad.Descripcion_facu', header: 'Facultad' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_ua', 'Facultad.Descripcion_facu' ];
    dataKeyTable : string = 'Cod_unidad_academica';
    selectedRows: UnidadAcademica[] = [];

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