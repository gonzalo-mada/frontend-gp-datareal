import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { WindowService } from 'src/app/base/services/window.service';

interface Column {
    field: string;
    header: string;
    width: string;
    useMinWidth: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class TablePlanesDeEstudiosService {

    selectedRows: PlanDeEstudio[] = [];
    globalFiltros : any[] = [ 'Cod_Programa' , 'Nombre_programa' ];
    dataKeyTable : string = 'Cod_plan_estudio';
    _selectedColumns!: Column[];
    cols: Column[] = [
        { field: 'Acreditacion', header: 'Acreditacion', width: '200px', useMinWidth: true },
        { field: 'Tipo_programa', header: 'Tipo de programa', width: '200px', useMinWidth: true },
        { field: 'Centro_costo', header: 'Centro costo', width: '155px', useMinWidth: true },
        { field: 'Titulo', header: 'Título', width: '150px', useMinWidth: true },
        { field: 'Rexe', header: 'REXE', width: '130px', useMinWidth: true },
        { field: 'Codigo_SIES', header: 'Código SIES', width: '155px', useMinWidth: true },
        { field: 'Creditos_totales', header: 'Créditos totales', width: '180px', useMinWidth: true },
        { field: 'Horas_totales', header: 'Horas totales', width: '170px', useMinWidth: true },
        { field: 'Grupo_correo', header: 'Grupo correo', width: '160px', useMinWidth: true },
        { field: 'Grado_academico', header: 'Grado académico', width: '190px', useMinWidth: true },
        { field: 'Estado_maestro', header: 'Estado maestro', width: '180px', useMinWidth: true },
        { field: 'Reglamento', header: 'Reglamento', width: '170px', useMinWidth: true },
        { field: 'Unidad_academica', header: 'Unidades académicas', width: '300px', useMinWidth: true }
    ];
    constructor(
        private tableCrudService: TableCrudService,
        private windowService: WindowService
    ){
        const storedColumns = this.windowService.getItemSessionStorage('selectedCols-table-plan-de-estudio');
        if (storedColumns) {
            const parsedColumns = JSON.parse(storedColumns);
            this._selectedColumns = this.cols.filter((col) =>
              parsedColumns.some((storedCol: Column) => storedCol.field === col.field)
            );
        } else {
            this._selectedColumns = this.cols;
        }
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }
    
    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
        this.windowService.setItemSessionStorage('selectedCols-table-plan-de-estudio', JSON.stringify(this._selectedColumns));
    }

    setSelectedRows(){
        this.tableCrudService.setSelectedRows(this.selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows = [];
        this.setSelectedRows();
    }

    getColStyle(col: any) {
        if (col.useMinWidth) {
          return { 'min-width': col.width };
        } else {
          return { 'width': col.width };
        }
    }
}