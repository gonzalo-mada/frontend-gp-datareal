import { Injectable } from '@angular/core';
import { TableCrudService } from '../../components/table-crud.service';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { WindowService } from 'src/app/base/services/window.service';

interface Column {
    field: string;
    header: string;
    width: string;
    useMinWidth: boolean;
    getValue?: (data: any) => any;
}

@Injectable({
    providedIn: 'root'
})

export class TablePlanesDeEstudiosService {

    selectedRows: PlanDeEstudio[] = [];
    globalFiltros : any[] = [ 'cod_plan_estudio' , 'cod_programa' , 'nombre_plan_estudio_completo', 'nombre_programa_completo',   ];
    dataKeyTable : string = 'cod_plan_estudio';
    _selectedColumns!: Column[];
    cols: Column[] = [
        { field: 'cod_programa', header: 'Programa', width: '400px', useMinWidth: true},
        { field: 'case_menciones', header: 'Menciones', width: '200px', useMinWidth: true},
        { field: 'cupo_minimo', header: 'Cupo mínimo', width: '200px', useMinWidth: true, getValue: (data: any) => data?.cupo_minimo || ''  },
        { field: 'jornada.descripcion_jornada', header: 'Jornada', width: '200px', useMinWidth: true, getValue: (data: any) => data?.jornada?.descripcion_jornada || '' },
        { field: 'modalidad.descripcion_modalidad', header: 'Modalidad', width: '200px', useMinWidth: true, getValue: (data: any) => data?.modalidad?.descripcion_modalidad || '' },
        { field: 'estado.descripcion_estado', header: 'Estado', width: '200px', useMinWidth: true, getValue: (data: any) => data?.estado?.descripcion_estado || '' },
        { field: 'rexe', header: 'REXE', width: '200px', useMinWidth: true, getValue: (data: any) => data?.rexe || '' },
        // { field: 'Certificacion', header: 'Certificación', width: '200px', useMinWidth: true, getValue: (data: any) => data?.Certificacion || '' },
        { field: 'case_articulaciones', header: 'Articulaciones', width: '200px', useMinWidth: true },
        { field: 'reglamento.descripcion_reglamento', header: 'Reglamento', width: '200px', useMinWidth: true, getValue: (data: any) => data?.reglamento?.descripcion_reglamento || '' },
        { field: 'case_plancomun', header: 'Plan_comun (pendiente)', width: '200px', useMinWidth: true },
        { field: 'case_rangos', header: 'Rangos de aprobación (pendiente)', width: '200px', useMinWidth: true},
        { field: 'case_certificacion', header: 'Certificación intermedia', width: '200px', useMinWidth: true},
        { field: 'regimen.descripcion_regimen', header: 'Régimen', width: '200px', useMinWidth: true, getValue: (data: any) => data?.regimen?.descripcion_regimen || '' },

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