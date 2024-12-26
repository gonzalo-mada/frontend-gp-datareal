import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';

@Injectable({
    providedIn: 'root'
})

export class TableArticulacionesService {


    cols : any[] = [
        { field: 'Descripcion_programa_pregrado', header: 'Programa pregrado' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas articuladas' },
        { field: 'Cod_plan_estudio', header: 'Plan de estudio' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'nombre_plan_estudio_completo' , 'Descripcion_programa_pregrado' ];
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