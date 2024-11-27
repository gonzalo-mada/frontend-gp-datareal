import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';

@Injectable({
    providedIn: 'root'
})

export class TableCertifIntermediaService {

    cols : any[] = [
        { field: 'Descripcion_certif_inter', header: 'Nombre' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_certif_inter' ];
    dataKeyTable : string = 'Cod_CertificacionIntermedia';
    selectedRows: CertificacionIntermedia[] = [];

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