import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';

@Injectable({
    providedIn: 'root'
})

export class TableAsignaturasPlancomunService {

    cols : any[] = [
        { field: 'Cod_plan_estudio', header: 'Plan de estudio' },
        { field: 'Cod_', header: 'Certificación intermedia' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Cod_plan_estudio' , 'Descripcion_programa_pregrado' , 'Descripcion_programa_pregrado' ];
    globalFiltrosAsignatura : any[] = [ 'cod_asignatura' , 'nombre_asignatura' , 'cod_tema' , 'tema' ];
    dataKeyTable : string = 'Cod_Articulacion';
    selectedRows: AsignaturasPlancomun[] = [];
    selectedAsignaturaRows: any[] = [];

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

    resetSelectedRowsTableAsignaturas(){
        this.selectedAsignaturaRows = [];
    }

    resetSelectedRowsAllTables(){
        this.resetSelectedRowsTableAsignaturas();
    }
}