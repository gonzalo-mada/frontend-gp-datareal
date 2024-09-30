import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Programa } from 'src/app/project/models/Programa';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-table-programas',
  templateUrl: './table-programas.component.html',
  styles: [
  ]
})
export class TableProgramasComponent implements OnInit, OnChanges, OnDestroy {
  
  constructor(public configModeService: ConfigModeService, private programasService: ProgramasService, private tableCrudService: TableCrudService){}
  @Input() data: any[] = [];

  selectedRow: Programa[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';

  private subscription: Subscription = new Subscription();

  get isPostgrado() {
    return this.configModeService.config().isPostgrado
  }
  
  ngOnInit(): void {
    this.subscription = this.tableCrudService.resetSelectedRowsSubject$.subscribe( () => this.selectedRow = []);

    this.cols = [
      { field: 'Cod_Programa', header: 'Código' },
      { field: 'Nombre_programa', header: 'Nombre' },
      { field: 'Tipo_programa', header: 'Tipo de programa' },
      { field: 'Acreditado', header: 'Estado acreditación' },
      { field: 'Certificado', header: 'Estado certificación' },
      { field: 'EstadoMaestro', header: 'Estado maestro' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'Cod_Programa' , 'Nombre_programa' , 'Tipo_programa', 'EstadosAcreditacion', 'EstadoMaestro' ];

    this.dataKeyTable = 'Cod_Programa';
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

  edit(data: Programa){
    this.programasService.setModeCrud('edit',data);
  }

  show(data: Programa){
    this.programasService.setModeCrud('show',data);
  }

  delete(data: Programa){
    this.programasService.setModeCrud('delete',data);
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

  showColumn(field: string): boolean {
    if ( this.configModeService.config().isPostgrado){
      return  field === 'Cod_Programa' ||
              field === 'Nombre_programa' ||
              field === 'Tipo_programa' ||
              field === 'Acreditado' ||
              field === 'EstadoMaestro'
    }else{
      return  field === 'Cod_Programa' ||
              field === 'Nombre_programa' ||
              field === 'Tipo_programa' ||
              field === 'Certificado' ||
              field === 'EstadoMaestro' 
    }
  }

}
