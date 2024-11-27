import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { WindowService } from 'src/app/base/services/window.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramaMainService } from 'src/app/project/services/programas/programas/main.service';
import { TableProgramasService } from 'src/app/project/services/programas/programas/table.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';

interface Column {
  field: string;
  header: string;
  width: string;
  useMinWidth: boolean;
}

@Component({
  selector: 'app-table-programas',
  templateUrl: './table-programas.component.html',
  styles: [
  ]
})
export class TableProgramasComponent implements OnInit, OnDestroy {
  
  constructor(
    public tableProgramasService: TableProgramasService,
    private windowService: WindowService,
    public programaMainService: ProgramaMainService
  ){}

  selectedRow: Programa[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: Column[] = [];
  _selectedColumns!: Column[];
  programaFrozen: boolean = false;
  private subscription: Subscription = new Subscription();

  
  ngOnInit(): void {
    this.cols = [
      // { field: 'Nombre_programa', header: '', width: '10rem', useMinWidth: true },
      // { field: 'Programa', header: 'Programa', width: '500px', useMinWidth: true },
      { field: 'Acreditacion', header: 'Acreditacion', width: '200px', useMinWidth: true },
      { field: 'Tipo_programa', header: 'Tipo de programa', width: '200px', useMinWidth: true },
      { field: 'Centro_costo', header: 'Centro costo', width: 'auto', useMinWidth: false },
      { field: 'Titulo', header: 'Título', width: '300px', useMinWidth: true },
      { field: 'Rexe', header: 'REXE', width: 'auto', useMinWidth: false },
      { field: 'Codigo_SIES', header: 'Codigo SIES', width: 'auto', useMinWidth: false },
      { field: 'Creditos_totales', header: 'Créditos totales', width: 'auto', useMinWidth: false },
      { field: 'Horas_totales', header: 'Horas totales', width: 'auto', useMinWidth: false },
      { field: 'Grupo_correo', header: 'Grupo correo', width: 'auto', useMinWidth: false },
      { field: 'Grado_academico', header: 'Grado académico', width: '300px', useMinWidth: true },
      { field: 'Estado_maestro', header: 'Estado maestro', width: 'auto', useMinWidth: false },
      { field: 'Reglamento', header: 'Reglamento', width: 'auto', useMinWidth: false },
      { field: 'Unidad_academica', header: 'Unidades académicas', width: '300px', useMinWidth: true }
    ];
    this.originalData = [...this.programaMainService.programas];
    const storedColumns = this.windowService.getItemSessionStorage('selectedCols-table-programa');
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
    this.windowService.setItemSessionStorage('selectedCols-table-programa', JSON.stringify(this._selectedColumns));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.tableProgramasService.resetSelectedRows();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.tableProgramasService.resetSelectedRows();
  }

  refresh(){
    this.programaMainService.getProgramasPorFacultad();
  }

  edit(data: Programa){
    this.programaMainService.setModeCrud('edit',data);
  }

  show(data: Programa){
    this.programaMainService.setModeCrud('show',data);
  }

  delete(data: Programa){
    this.programaMainService.setModeCrud('delete',data);
  }

  clear(table: Table){
    this.tableProgramasService.resetSelectedRows();
    this.searchValue = ''
    this.programaMainService.programas = [...this.originalData];
    table.reset();
  }

  getColStyle(col: any) {
    if (col.useMinWidth) {
      return { 'min-width': col.width };
    } else {
      return { 'width': col.width };
    }
  }

  customSortAccreditation(event:any) {

    switch (event.field) {

      case 'Acreditacion':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Acreditacion ? data1.Acreditacion.Acreditado : '';
          const value2 = data2.Acreditacion ? data2.Acreditacion.Acreditado : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break;

      case 'Tipo_programa':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Tipo_programa ? data1.Tipo_programa.Descripcion_tp : '';
          const value2 = data2.Tipo_programa ? data2.Tipo_programa.Descripcion_tp : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break
    
      default:
        event.data?.sort((data1:any , data2:any) => {
          let value1 = data1[event.field];
          let value2 = data2[event.field];
          let result = null;
          if (value1 == null && value2 != null) result = -1;
          else if (value1 != null && value2 == null) result = 1;
          else if (value1 == null && value2 == null) result = 0;
          else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
          else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

          return event.order * result;
        })
      break;
    }


  }

}
