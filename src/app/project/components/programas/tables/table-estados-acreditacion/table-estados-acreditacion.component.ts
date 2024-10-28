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



}
