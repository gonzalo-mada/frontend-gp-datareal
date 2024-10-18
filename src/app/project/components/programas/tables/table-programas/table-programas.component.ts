import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { WindowService } from 'src/app/base/services/window.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

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
export class TableProgramasComponent implements OnInit, OnChanges, OnDestroy {
  
  constructor(
    public configModeService: ConfigModeService, 
    private programasService: ProgramasService, 
    private tableCrudService: TableCrudService,
    private windowService: WindowService
  ){}
  @Input() data: any[] = [];

  selectedRow: Programa[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: Column[] = [];
  _selectedColumns!: Column[];
  globalFiltros: any[] = []
  dataKeyTable: string = '';
  programaFrozen: boolean = false;
  private subscription: Subscription = new Subscription();

  get isPostgrado() {
    return this.configModeService.config().isPostgrado
  }
  
  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
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
      { field: 'Unidad_academica', header: 'Unidad académica', width: '300px', useMinWidth: true }
    ];

    const storedColumns = this.windowService.getItemSessionStorage('selectedCols-table-programa');
    if (storedColumns) {
      const parsedColumns = JSON.parse(storedColumns);
      this._selectedColumns = this.cols.filter((col) =>
        parsedColumns.some((storedCol: Column) => storedCol.field === col.field)
      );
    } else {
      this._selectedColumns = this.cols;
    }

    this.globalFiltros = [ 'Cod_Programa' , 'Nombre_programa' ];

    this.dataKeyTable = 'Cod_Programa';
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
    this.windowService.setItemSessionStorage('selectedCols-table-programa', JSON.stringify(this._selectedColumns));
  }

  showColumn(field: string): boolean {
    if ( this.configModeService.config().isPostgrado){
      return  field === 'Cod_Programa' ||
              field === 'Campus.Descripcion_campus' ||
              field === 'Nombre_programa' ||
              field === 'Tipo_programa' ||
              field === 'Acreditado' ||
              field === 'EstadoMaestro'
    }else{
      return  field === 'Cod_Programa' ||
              field === 'Campus.Descripcion_campus' ||
              field === 'Nombre_programa' ||
              field === 'Tipo_programa' ||
              field === 'Certificado' ||
              field === 'EstadoMaestro' 
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.originalData = [...this.data];
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.resetSelectedRows();
  }

  refresh(){
    this.tableCrudService.emitClickRefreshTable();
  }

  edit(data: Programa){
    this.programasService.setModeCrud('edit',data);
  }

  show(data: Programa){
    this.programasService.setModeCrud('show',data);
  }

  delete(data: Programa){
    this.programasService.setModeCrud('delete',data);
  }

  selectionChange(){   
    this.tableCrudService.setSelectedRows(this.selectedRow)
  }

  resetSelectedRows(){    
    this.selectedRow = [];
    this.tableCrudService.setSelectedRows(this.selectedRow)
  }

  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
    this.data = [...this.originalData];
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
