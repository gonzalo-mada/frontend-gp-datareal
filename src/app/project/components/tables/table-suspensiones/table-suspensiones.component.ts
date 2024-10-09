import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Suspension } from 'src/app/project/models/Suspension';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { SuspensionesService } from 'src/app/project/services/suspensiones.service';

@Component({
  selector: 'app-table-suspensiones',
  templateUrl: './table-suspensiones.component.html',
  styles: [
  ]
})
export class TableSuspensionesComponent implements OnInit, OnChanges, OnDestroy {
  constructor( private suspensionesService: SuspensionesService,
    private tableCrudService: TableCrudService)
  {}
  @Input() data: any[] = [];

  selectedRow: Suspension[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);

    this.cols = [
      { field: 'Descripcion_TipoSuspension', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Descripcion_TipoSuspension' ];
    this.dataKeyTable = 'ID_TipoSuspension';
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
  
  edit(data: Suspension){
    this.suspensionesService.setModeCrud('edit',data)
  }

  show(data: Suspension){
    this.suspensionesService.setModeCrud('show',data)
  }

  delete(data: Suspension){
    this.suspensionesService.setModeCrud('delete',data)
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
