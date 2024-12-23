import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';

@Injectable({
    providedIn: 'root'
})

export class TablePlanesDeEstudiosService {

    selectedRows: PlanDeEstudio[] = [];
    // globalFiltros : any[] = [ 'Cod_Programa' , 'Nombre_programa' ];
    // dataKeyTable : string = 'Cod_Programa';

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }
}