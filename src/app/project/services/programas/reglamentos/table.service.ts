import { Injectable } from '@angular/core';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { TableCrudService } from '../../components/table-crud.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class TableReglamentosService {

    private refreshTablesReglamentos = new Subject<void>();
    refreshTableReglamento$ = this.refreshTablesReglamentos.asObservable();
    leyendas: any[] = [
        {icon: 'pi pi-chevron-right' , leyenda: 'Permite ver documentos adjuntos'},
        {icon: 'pi pi-check' , leyenda: 'Permite seleccionar reglamento'},
        {icon: 'pi pi-minus' , leyenda: 'Permite deseleccionar reglamento'},
        {icon: 'pi pi-pencil' , leyenda: 'Permite editar reglamento'}
    ];
    cols : any[] = [
        { field: 'Descripcion_regla', header: 'Nombre' },
        { field: 'vigencia', header: 'Vigencia' },
        { field: 'anio', header: 'Año' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = [ 'Descripcion_regla' ];
    dataKeyTable : string = 'Cod_reglamento';
    selectedRows: Reglamento[] = [];

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }

    emitRefreshTablesReglamentos(){
        this.refreshTablesReglamentos.next();
    }

    emitResetExpandedRows(){
        this.tableCrudService.emitResetExpandedRowsTable();
    }

}