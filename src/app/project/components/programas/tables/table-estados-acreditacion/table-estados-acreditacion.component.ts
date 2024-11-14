import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { EstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion.service';

@Component({
  selector: 'app-table-estados-acreditacion',
  templateUrl: './table-estados-acreditacion.component.html',
  styles: [
  ]
})
export class TableEstadosAcreditacionComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any[] = [];

  selectedRow: EstadosAcreditacion[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = ''

  private subscription: Subscription = new Subscription();

  constructor(
              public configModeService: ConfigModeService, 
              private estadosAcreditacionService: EstadosAcreditacionService,
              private tableCrudService: TableCrudService
            ){}

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    
    this.cols = [
      { field: 'Sigla', header: 'Identificador' },
      { field: 'Acreditado', header: 'Estado' },
      { field: 'Evaluacion_interna', header: 'Evaluación interna' },
      { field: 'Fecha_informe', header: 'Fecha informe' },
      // { field: 'tiempo.Fecha_termino', header: 'Fecha_termino' },
      { field: 'accion', header: 'Acciones' }
    ];
    
    this.globalFiltros = [
      'Sigla', 
      'Acreditado' , 
      'Nombre_ag_acredit' , 
      'Evaluacion_interna' , 
      'Fecha_informe' , 
      'tiempo.Fecha_inicio' ,
      'tiempo.Fecha_termino' ,
      'tiempo.Cantidad_anios' 
    ]
    this.dataKeyTable = 'Cod_acreditacion';
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
  
  edit(data: EstadosAcreditacion){
    this.estadosAcreditacionService.setModeCrud('edit',data);
  }

  show(data: EstadosAcreditacion){
    this.estadosAcreditacionService.setModeCrud('show',data);
  }

  delete(data: EstadosAcreditacion){
    this.estadosAcreditacionService.setModeCrud('delete',data);
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

  customSort(event:any){
    switch (event.field) {
      case 'Fecha_informe':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Fecha_informe ? data1.Fecha_informe : '';
          const value2 = data2.Fecha_informe ? data2.Fecha_informe : '';

          let newValue1 = this.convertirStringAFecha(value1);
          let newValue2 = this.convertirStringAFecha(value2);

          let result = 0;
          if (newValue1 > newValue2) {
            result = 1;
          } else if (newValue1 < newValue2) {
            result = -1;
          }
          return event.order * result;
        });
      break;
    
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
        });
      break;
    }
  }

  convertirStringAFecha(fechaStr: string): Date {
    const [day, month, year] = fechaStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

}
