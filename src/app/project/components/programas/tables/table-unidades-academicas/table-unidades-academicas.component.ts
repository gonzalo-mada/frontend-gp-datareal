import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UnidadesAcademicasService } from 'src/app/project/services/programas/unidades-academicas.service';

@Component({
  selector: 'app-table-unidades-academicas',
  templateUrl: './table-unidades-academicas.component.html',
  styles: [
  ]
})
export class TableUnidadesAcademicasComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];

 
  mode : string = '';
  selectedRow: UnidadAcademica[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';
 
  private subscription: Subscription = new Subscription();
 
  constructor(private unidadesAcademicasService: UnidadesAcademicasService, private tableCrudService: TableCrudService){}
 
  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);
    this.cols = [
      { field: 'Descripcion_ua', header: 'Nombre' },
      { field: 'Facultad.Descripcion_facu', header: 'Facultad' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_ua', 'Facultad.Descripcion_facu' ]
    this.dataKeyTable = 'Cod_unidad_academica';
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
 
  edit(data: UnidadAcademica){
    this.unidadesAcademicasService.setModeCrud('edit',data);
  }
 
  show(data: UnidadAcademica){
    this.unidadesAcademicasService.setModeCrud('show',data);
  }
 
  delete(data: UnidadAcademica){
    this.unidadesAcademicasService.setModeCrud('delete',data);
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
