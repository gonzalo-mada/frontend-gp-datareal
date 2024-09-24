import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { CategoriaTp } from 'src/app/project/models/CategoriaTp';
import { CategoriasTpService } from 'src/app/project/services/categorias-tp.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';

@Component({
  selector: 'app-table-categorias-tp',
  templateUrl: './table-categorias-tp.component.html',
  styles: [
  ]
})
export class TableCategoriasTpComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any[] = [];

  selectedRow: CategoriaTp[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  constructor( private categoriasTpService: CategoriasTpService,
    private tableCrudService: TableCrudService){}

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);

    this.cols = [
      { field: 'Descripcion_categoria', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Descripcion_categoria' ];
    this.dataKeyTable = 'Cod_CategoriaTP';
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
  
  edit(data: CategoriaTp){
    this.categoriasTpService.setModeCrud('edit',data)
  }

  show(data: CategoriaTp){
    this.categoriasTpService.setModeCrud('show',data)
  }

  delete(data: CategoriaTp){
    this.categoriasTpService.setModeCrud('delete',data)
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
