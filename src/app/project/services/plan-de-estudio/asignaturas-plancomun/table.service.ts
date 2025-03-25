import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';

@Injectable({
    providedIn: 'root'
})

export class TableAsignaturasPlancomunService {

    cols : any[] = [
        { field: 'cod_plan_estudio_plan_comun', header: 'Plan común' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'cod_plan_estudio_plan_comun' , 'nombre_plan_comun_completo'];
    globalFiltrosAsignatura : any[] = [ 'codigo_externo' , 'nombre_asignatura' , 'nombre_tema' ];
    dataKeyTable : string = 'cod_plan_estudio_plan_comun';
    selectedRows: AsignaturasPlancomun[] = [];
    selectedAsignaturaRows: any[] = [];

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.resetSelectedRowsAllTables();
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