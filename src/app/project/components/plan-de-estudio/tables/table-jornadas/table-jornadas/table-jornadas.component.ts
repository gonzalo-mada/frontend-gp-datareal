import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';

@Component({
  selector: 'app-table-jornadas',
  templateUrl: './table-jornadas.component.html',
  styles: [
  ]
})
export class TableJornadasComponent implements OnInit, OnChanges, OnDestroy {
  constructor( private jornadasService: JornadaService,
    private tableCrudService: TableCrudService)
  {}
  @Input() data: any[] = [];

  selectedRow: Jornada[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);

    this.cols = [
      { field: 'Descripcion_jornada', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Descripcion_jornada' ];
    this.dataKeyTable = 'Cod_jornada';
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

  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }
  resetSelectedRows(){    
    this.selectedRow = [];
    this.tableCrudService.setSelectedRows(this.selectedRow)
  }

  selectionChange(){   
    this.tableCrudService.setSelectedRows(this.selectedRow)
  }

  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.resetSelectedRows();
  }

  refresh(){
    this.tableCrudService.emitClickRefreshTable();
  }
  
  edit(data: Jornada){
    this.jornadasService.setModeCrud('edit',data)
  }

  show(data: Jornada){
    this.jornadasService.setModeCrud('show',data)
  }

  delete(data: Jornada){
    this.jornadasService.setModeCrud('delete',data)
  }

}
