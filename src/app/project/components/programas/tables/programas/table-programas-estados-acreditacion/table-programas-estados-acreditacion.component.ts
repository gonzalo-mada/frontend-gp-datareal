import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Programa } from 'src/app/project/models/programas/Programa';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { EstadosAcreditacionMainService } from 'src/app/project/services/programas/estados-acreditacion/main.service';
import { TableEstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion/table.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-table-programas-estados-acreditacion',
  templateUrl: './table-programas-estados-acreditacion.component.html',
  styles: [
  ]
})

export class TableProgramasEstadosAcreditacionComponent implements OnInit, OnDestroy {

  @Input() programa: Programa = {};
  @Input() mode: string = '';
  @Input() isAnySelected: boolean = false;
  searchValue: string | undefined;
  originalData: any[] = [];
  expandedRows = {};
  estados: EstadosAcreditacion[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    public table: TableEstadosAcreditacionService,
    public main: EstadosAcreditacionMainService,
    private form: FormProgramaService, 
    private tableCrudService: TableCrudService,
  ){}

  ngOnInit(): void {
    this.getData(false);
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => {this.resetExpandedRows()} ));
    this.subscription.add(this.table.refreshTableEA$.subscribe( () => this.getData(false) ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async getData(showCountTableValues: boolean){
    this.estados = await this.main.getEstadosAcreditacion(showCountTableValues);
    if (this.programa.Cod_acreditacion) {
      if (this.mode === 'show' ) {
        this.estados = this.estados.filter( e => e.Cod_acreditacion === this.programa.Cod_acreditacion)
      }else{
        this.estados.map( estado => {
          if (estado.Cod_acreditacion === this.programa.Cod_acreditacion) {
            estado.isSelected = true 
            this.form.stateFormUpdate = 'VALID';
          }else{
            estado.isSelected = false
          }
        });
      }
    }
    this.originalData = [...this.estados];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.resetExpandedRows();
  }

  clear(table: Table){
    this.expandedRows = {}; 
    this.searchValue = '';
    this.estados = [...this.originalData];
    table.reset();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  changeSelectEstadoAcreditacion(mode:'select' | 'unselect', data: EstadosAcreditacion){
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.form.setSelectEstadoAcreditacion(data);
      break;
      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.form.unsetSelectEstadoAcreditacion(data);
      break;
    }
  }

  async onRowExpand(event: TableRowExpandEvent) {
    this.main.setModeCrud('rowExpandClick',event.data)
  }

  edit(data: EstadosAcreditacion){
    this.main.setModeCrud('edit',data);
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

  getColStyle(col: any) {
    if (col.useMinWidth) {
      return { 'min-width': col.width };
    } else {
      return { 'width': col.width };
    }
  }

  customSort(event:any){
    switch (event.field) {
      case 'Fecha_informe':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Fecha_informe ? data1.Fecha_informe : '';
          const value2 = data2.Fecha_informe ? data2.Fecha_informe : '';

          let newValue1 = this.convertirStringAFecha(value1);
          let newValue2 = this.convertirStringAFecha(value2);

          let result = 0;
          if (newValue1 > newValue2) {
            result = 1;
          } else if (newValue1 < newValue2) {
            result = -1;
          }
          return event.order * result;
        });
      break;
    
      default:
        event.data?.sort((data1:any , data2:any) => {
          let value1 = data1[event.field];
          let value2 = data2[event.field];
          let result = null;
          if (value1 == null && value2 != null) result = -1;
          else if (value1 != null && value2 == null) result = 1;
          else if (value1 == null && value2 == null) result = 0;
          else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
          else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

          return event.order * result;
        });
      break;
    }
    
  }

  convertirStringAFecha(fechaStr: string): Date {
    const [day, month, year] = fechaStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

}
