import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TipoPrograma } from 'src/app/project/models/TipoPrograma';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { TiposprogramasService } from 'src/app/project/services/tipos-programas.service';

@Component({
  selector: 'app-table-tipos-programas',
  templateUrl: './table-tipos-programas.component.html',
  styles: [
  ]
})
export class TableTiposProgramasComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any[] = [];

  selectedRow: TipoPrograma[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  constructor(private tipoProgramaService: TiposprogramasService, 
    private tableCrudService: TableCrudService
  ){}

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    this.cols = [
      { field: 'Descripcion_tp', header: 'Nombre' },
      { field: 'Categoria.Descripcion_categoria', header: 'Categoría' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Descripcion_tp', 'Categoria.Descripcion_categoria' ];
    this.dataKeyTable = 'Cod_tipoPrograma';
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
  
  edit(data: TipoPrograma){
    this.tipoProgramaService.setModeCrud('edit',data)
  }

  show(data: TipoPrograma){
    this.tipoProgramaService.setModeCrud('show',data)
  }

  delete(data: TipoPrograma){
    this.tipoProgramaService.setModeCrud('delete',data)
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
