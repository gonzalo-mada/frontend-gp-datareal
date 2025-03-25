import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';

@Injectable({
    providedIn: 'root'
})

export class TableArticulacionesService {


    cols : any[] = [
        { field: 'asignatura', header: 'Asignatura' },
        { field: 'Asignaturas', header: 'Núm. de asignaturas articuladas' },
        { field: 'accion', header: 'Acciones' }
    ];
    globalFiltros : any[] = ['asignatura_postgrado.nombre_asignatura_completa' ];
    globalFiltrosAsignatura : any[] = [ 'codigo_externo' , 'nombre_asignatura' , 'nombre_tema' ];
    dataKeyTable : string = 'cod_articulacion';
    selectedRows: Articulacion[] = [];
    selectedAsignaturaPregrado: any[] = [];
    selectedAsignaturasPostgrado: any[] = [];

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

    resetSelectedAsignaturasPregrado(){
        this.selectedAsignaturaPregrado = [];
    }

    resetSelectedAsignaturasPostgrado(){
        this.selectedAsignaturasPostgrado = [];
    }

    resetSelectedRowsAllTables(){
        this.resetSelectedAsignaturasPregrado();
        this.resetSelectedAsignaturasPostgrado();
    }

    pushSelectedAsignaturaPregrado(event: any) {
        const exists = this.selectedAsignaturaPregrado.some(asignatura => asignatura.cod_tema === event.cod_tema);
        if (!exists) this.selectedAsignaturaPregrado.push(event);
        
    }
    
}