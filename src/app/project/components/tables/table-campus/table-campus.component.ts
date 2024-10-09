import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Campus } from 'src/app/project/models/Campus';
import { CampusService } from 'src/app/project/services/campus.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';

@Component({
  selector: 'app-table-campus',
  templateUrl: './table-campus.component.html',
  styles: [
  ]
})
export class TableCampusComponent implements OnInit ,OnChanges, OnDestroy {
  
  @Input() data: any[] = [];

  selectedRow: Campus[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  constructor(private campusService: CampusService, private tableCrudService: TableCrudService){}

  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    this.cols = [
      { field: 'Descripcion_campus', header: 'Nombre' },
      { field: 'Estado_campus', header: 'Estado' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_campus' ]
    this.dataKeyTable = 'Cod_campus';
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

  edit(data: Campus){
    this.campusService.setModeCrud('edit',data);
  }

  show(data: Campus){
    this.campusService.setModeCrud('show',data);
  }

  delete(data: Campus){
    this.campusService.setModeCrud('delete',data);
  }

  changeState(data: Campus , estado_campus: boolean){
    this.campusService.setModeCrud('changeState',data);
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
