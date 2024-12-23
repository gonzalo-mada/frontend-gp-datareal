import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';

@Injectable({
    providedIn: 'root'
})

export class TableArticulacionesService {


    cols : any[] = [
        { field: 'Cod_Articulacion', header: 'Código articulación' },
        { field: 'Cod_plan_estudio', header: 'Plan de estudio' },
        { field: 'Descripcion_programa_pregrado', header: 'Programa' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas articuladas' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Cod_Articulacion' , 'Cod_plan_estudio' , 'Descripcion_programa_pregrado' ];
    globalFiltrosPrograma : any[] = [ 'codPrograma' , 'nombreCarrera' ];
    globalFiltrosAsignatura : any[] = [ 'Cod_Asignatura' , 'Descripcion_asignatura' , 'Cod_Tema' , 'Descripcion_tema' ];
    dataKeyTable : string = 'Cod_Articulacion';
    selectedRows: Articulacion[] = [];
    selectedProgramaRows: any[] = [];
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

    resetSelectedRowsTablePrograma(){
        this.selectedProgramaRows = [];
    }

    resetSelectedRowsTableAsignaturas(){
        this.selectedAsignaturaRows = [];
    }

    resetSelectedRowsAllTables(){
        this.resetSelectedRowsTablePrograma();
        this.resetSelectedRowsTableAsignaturas();
    }

}