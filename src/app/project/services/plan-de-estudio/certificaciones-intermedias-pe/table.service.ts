import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';

@Injectable({
    providedIn: 'root'
})

export class TableCertifIntermediasPEService {

    cols : any[] = [
        { field: 'descripcion_certif_intermedia', header: 'Certificación intermedia' },
        { field: 'asignaturas', header: 'Núm. de asignaturas' },
        { field: 'accion', header: 'Acciones' }
    ];
    cols_asignatura: any[] = [
		{ field: 'nombre_asignatura_completa', header: 'Asignatura' }
	]
    globalFiltros : any[] = [ 'descripcion_certif_intermedia' ];
    globalFiltrosCertifIntermedia : any[] = [ 'Cod_CertificacionIntermedia' , 'Descripcion_certif_inter' ];
    dataKeyTable : string = 'cod_certif_intermedia';
    selectedRows: CertificacionIntermediaPE[] = [];
    selectedCertifIntermediaRows: any[] = [];
    selectedAsignaturaRows: any = {};

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

    resetSelectedRowsTableCertifIntermedias(){
        this.selectedCertifIntermediaRows = [];
    }

    resetSelectedRowsTableAsignaturas(){
        this.selectedAsignaturaRows = {};
    }

    resetSelectedRowsAllTables(){
        this.resetSelectedRowsTableCertifIntermedias();
        this.resetSelectedRowsTableAsignaturas();
    }
}