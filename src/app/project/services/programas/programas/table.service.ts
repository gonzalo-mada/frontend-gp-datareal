import { Injectable } from '@angular/core';
import { Programa } from 'src/app/project/models/programas/Programa';
import { TableCrudService } from '../../components/table-crud.service';

@Injectable({
    providedIn: 'root'
})

export class TableProgramasService {

    selectedRows: Programa[] = [];
    globalFiltros : any[] = [ 'Cod_Programa' , 'Nombre_programa' ];
    dataKeyTable : string = 'Cod_Programa';

    constructor(private tableCrudService: TableCrudService){}

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }
}