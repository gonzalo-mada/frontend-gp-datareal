import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';

@Injectable({
    providedIn: 'root'
})

export class TableCertifIntermediasPEService {

    cols : any[] = [
        { field: 'Cod_Articulacion', header: 'Código articulación' },
        { field: 'Cod_plan_estudio', header: 'Plan de estudio' },
        { field: 'Descripcion_programa_pregrado', header: 'Programa' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas articuladas' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Cod_Articulacion' , 'Cod_plan_estudio' , 'Descripcion_programa_pregrado' ];
    globalFiltrosCertifIntermedia : any[] = [ 'Cod_CertificacionIntermedia' , 'Descripcion_certif_inter' ];
    globalFiltrosAsignatura : any[] = [ 'cod_asignatura' , 'nombre_asignatura' , 'cod_tema' , 'tema' ];
    dataKeyTable : string = 'Cod_Articulacion';
    selectedRows: Articulacion[] = [];
    selectedCertifIntermediaRows: any[] = [];
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

    resetSelectedRowsTableCertifIntermedias(){
        this.selectedCertifIntermediaRows = [];
    }

    resetSelectedRowsTableAsignaturas(){
        this.selectedAsignaturaRows = [];
    }

    resetSelectedRowsAllTables(){
        this.resetSelectedRowsTableCertifIntermedias();
        this.resetSelectedRowsTableAsignaturas();
    }

}