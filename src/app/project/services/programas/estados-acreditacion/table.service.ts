import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class TableEstadosAcreditacionService {

    private refreshTableEA = new Subject<void>();
    refreshTableEA$ = this.refreshTableEA.asObservable();

    cols : any[] = [
        { field: 'Sigla', header: 'Identificador', width: '350px', useMinWidth: true },
        { field: 'Acreditado', header: 'Estado', width: '180px', useMinWidth: true },
        { field: 'Evaluacion_interna', header: 'Evaluación interna', width: 'auto', useMinWidth: false },
        { field: 'Fecha_informe', header: 'Fecha informe', width: 'auto', useMinWidth: false },
        { field: 'accion', header: 'Acciones', width: 'auto', useMinWidth: false }
    ];
    globalFiltros : any[] = [ 
        'Sigla', 
        'Acreditado' , 
        'Nombre_ag_acredit' , 
        'Nombre_ag_certif' , 
        'Evaluacion_interna' , 
        'Fecha_informe' , 
        'tiempo.Fecha_inicio' ,
        'tiempo.Fecha_termino' ,
        'tiempo.Cantidad_anios' 
     ];
    dataKeyTable : string = 'Cod_acreditacion';
    selectedRows: EstadosAcreditacion[] = [];

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }

    emitRefreshTablesEA(){
        this.refreshTableEA.next();
    }

    emitResetExpandedRows(){
        this.tableCrudService.emitResetExpandedRowsTable();
    }

}