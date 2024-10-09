import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Facultad } from 'src/app/project/models/Facultad';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FacultadService } from 'src/app/project/services/facultad.service';

@Component({
  selector: 'app-table-facultad',
  templateUrl: './table-facultad.component.html',
  styles: [
  ]
})
export class TableFacultadComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any[] = [];

  selectedRow: Facultad[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  constructor(private facultadService: FacultadService, private tableCrudService: TableCrudService){}

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    this.cols = [
      { field: 'Descripcion_facu', header: 'Nombre' },
      { field: 'Estado_facu', header: 'Estado' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_facu' ];
    this.dataKeyTable = 'Cod_facultad';
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
  
  edit(data: Facultad){
    this.facultadService.setModeCrud('edit',data);
  }

  show(data: Facultad){
    this.facultadService.setModeCrud('show',data);
  }

  delete(data: Facultad){
    this.facultadService.setModeCrud('delete',data);
  }

  changeState(data: Facultad){
    this.facultadService.setModeCrud('changeState',data);
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
