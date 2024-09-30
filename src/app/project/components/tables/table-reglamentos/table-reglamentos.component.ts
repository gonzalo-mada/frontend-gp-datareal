import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ReglamentosService } from 'src/app/project/services/reglamentos.service';

@Component({
  selector: 'app-table-reglamentos',
  templateUrl: './table-reglamentos.component.html',
  styles: [
  ]
})

export class TableReglamentosComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];

  selectedRow: Reglamento[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols : any[] = [];
  globalFiltros : any[] = [];
  dataKeyTable : string = '';
 
  private subscription: Subscription = new Subscription();

  constructor(private reglamentosService: ReglamentosService, private tableCrudService: TableCrudService){}
 
  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    this.cols = [
      { field: 'Descripcion_regla', header: 'Nombre' },
      { field: 'vigencia', header: 'Vigencia' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_regla' ]
    this.dataKeyTable = 'Cod_reglamento';
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
  }
 
  refresh(){
    this.tableCrudService.emitClickRefreshTable();
  }
 
  edit(data: Reglamento){
    this.reglamentosService.setModeCrud('edit',data);

  }
 
  show(data: Reglamento){
    this.reglamentosService.setModeCrud('show', data);
  }
 
  delete(data: Reglamento){
    this.reglamentosService.setModeCrud('delete', data);
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