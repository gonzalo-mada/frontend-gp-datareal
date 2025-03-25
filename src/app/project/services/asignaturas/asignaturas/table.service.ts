import { Injectable } from '@angular/core';
import { WindowService } from 'src/app/base/services/window.service';
import { TableCrudService } from '../../components/table-crud.service';
import { Asignatura } from 'src/app/project/models/asignaturas/Asignatura';

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

export class TableAsignaturasService {

    selectedRows: Asignatura[] = [];
    globalFiltros : any[] = [ 'codigo_externo' , 'nombre_asignatura' ];
    dataKeyTable : string = 'cod_asignatura';
    _selectedColumns!: Column[];
    cols: Column[] = [
        { field: 'semestre', header: 'Semestre', width: '200px', useMinWidth: true, getValue: (data: any) => data?.semestre || '' },
        { field: 'duracion', header: 'Duración', width: '200px', useMinWidth: true, getValue: (data: any) => data?.duracion || '' },
        { field: 'max_duracion', header: 'Máximo duración', width: '200px', useMinWidth: true, getValue: (data: any) => data?.max_duracion || '' },
        { field: 'num_creditos', header: 'Núm. créditos', width: '200px', useMinWidth: true, getValue: (data: any) => data?.num_creditos || '' },
        { field: 'total_horas', header: 'Total horas', width: '200px', useMinWidth: true, getValue: (data: any) => data?.total_horas || '' },
        { field: 'obligatoria_electiva', header: 'Obligatoria / Electiva', width: '220px', useMinWidth: true, getValue: (data: any) => data?.obligatoria_electiva || '' },
        { field: 'case_horas_directas', header: 'Horas directas', width: '200px', useMinWidth: true},
        { field: 'horas_indirectas', header: 'Horas indirectas', width: '200px', useMinWidth: true, getValue: (data: any) => data?.horas_indirectas || '' },
        { field: 'modalidad.descripcion_modalidad', header: 'Modalidad', width: '200px', useMinWidth: true, getValue: (data: any) => data?.modalidad?.descripcion_modalidad || '' },
        { field: 'regimen.descripcion_regimen', header: 'Régimen', width: '200px', useMinWidth: true, getValue: (data: any) => data?.regimen?.descripcion_regimen || '' },
        { field: 'tipo_evaluacion.descripcion_tipo_evaluacion', header: 'Tipo evaluación', width: '200px', useMinWidth: true, getValue: (data: any) => data?.tipo_evaluacion?.descripcion_tipo_evaluacion || '' },
        { field: 'case_tipo_colegiada', header: 'Tipo colegiada', width: '200px', useMinWidth: true},
        { field: 'case_menciones', header: 'Menciones', width: '200px', useMinWidth: true},
        { field: 'case_evaluacion_intermedia', header: 'Evaluación intermedia', width: '230px', useMinWidth: true},
        { field: 'case_pre_requisitos', header: 'Prerrequisitos', width: '200px', useMinWidth: true},
        { field: 'case_articulaciones', header: 'Articulaciones', width: '200px', useMinWidth: true },
        { field: 'case_temas', header: 'Temas', width: '200px', useMinWidth: true },
        { field: 'case_secuencial', header: 'Asign. secuenciales', width: '220px', useMinWidth: true },
        { field: 'case_paralela', header: 'Asign. paralelas', width: '220px', useMinWidth: true },
    ];
    constructor(
        private tableCrudService: TableCrudService,
        private windowService: WindowService
    ){
        const storedColumns = this.windowService.getItemSessionStorage('selectedCols-table-asignaturas');
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
        this.windowService.setItemSessionStorage('selectedCols-table-asignaturas', JSON.stringify(this._selectedColumns));
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