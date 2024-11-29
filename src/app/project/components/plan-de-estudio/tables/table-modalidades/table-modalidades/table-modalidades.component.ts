import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { ModalidadesService } from 'src/app/project/services/plan-de-estudio/modalidades.service';

@Component({
  selector: 'app-table-modalidades',
  templateUrl: './table-modalidades.component.html',
  styles: [
  ]
})
export class TableModalidadesComponent implements OnInit, OnDestroy {
  constructor( private modalidadesService: ModalidadesService,
    private tableCrudService: TableCrudService)
  {}

  @Input() data: any[] = [];

  selectedRow: Modalidad[] = [] ;
  searchValue: string | undefined;
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);

    this.cols = [
      { field: 'Descripcion_modalidad', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Descripcion_modalidad' ];
    this.dataKeyTable = 'Cod_modalidad';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
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
  
  edit(data: Modalidad){
    this.modalidadesService.setModeCrud('edit',data)
  }

  show(data: Modalidad){
    this.modalidadesService.setModeCrud('show',data)
  }

  delete(data: Modalidad){
    this.modalidadesService.setModeCrud('delete',data)
  }

}
