import { Injectable } from '@angular/core';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { TableCrudService } from '../../components/table-crud.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableMencionesService {

    cols : any[] = [
        { field: 'nombre_mencion', header: 'Nombre' },
        { field: 'descripcion_mencion', header: 'Descripción' },
        { field: 'fecha_creacion', header: 'Fecha de creación' },
        { field: 'asignaturas', header: 'Núm. de asignaturas' },
        { field: 'Acciones', header: 'Acciones' },
    ];
    globalFiltros : any[] = [ 'nombre_mencion', 'descripcion_mencion', 'mencion_rexe', 'fecha_creacion' ];
    dataKeyTable : string = 'cod_mencion_pe';
    selectedRows: Mencion[] = [];

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