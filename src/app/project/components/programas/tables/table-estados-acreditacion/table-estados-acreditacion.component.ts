import { Component,Input,OnDestroy, OnInit } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Programa } from 'src/app/project/models/programas/Programa';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { EstadosAcreditacionMainService } from 'src/app/project/services/programas/estados-acreditacion/main.service';
import { TableEstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion/table.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-table-estados-acreditacion',
  templateUrl: './table-estados-acreditacion.component.html',
  styles: [
  ]
})
export class TableEstadosAcreditacionComponent implements OnInit, OnDestroy {
  @Input() programa: Programa = {};
  @Input() mode: string = '';
  @Input() from: string = '';

  searchValue: string | undefined;
  expandedRows = {};
  estados: EstadosAcreditacion[] = [];
  isAnySelected: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
    public formPrograma: FormProgramaService,
    public main: EstadosAcreditacionMainService, 
    public table: TableEstadosAcreditacionService,
    private tableCrudService: TableCrudService
  ){}

  async ngOnInit() {
    this.from === 'mantenedor' ? this.getData(true) : this.getData(false)
    this.subscription.add(this.table.refreshTableEA$.subscribe( () => this.getData(false) ));
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => this.resetExpandedRows() ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    this.estados = await this.main.getEstadosAcreditacion(showCountTableValues);
    if (this.programa.Cod_acreditacion) {
      this.estados.map( estado => {
        if (estado.Cod_acreditacion === this.programa.Cod_acreditacion) {
          estado.isSelected = true 
          this.formPrograma.stateFormUpdate = 'VALID';
          this.isAnySelected = true;
        }else{
          estado.isSelected = false
        }
      });
    }
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }
  
  edit(data: EstadosAcreditacion){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: EstadosAcreditacion){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: EstadosAcreditacion){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.expandedRows = {};
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
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

  onRowExpand(event: TableRowExpandEvent) {
    this.main.setModeCrud('rowExpandClick',event.data)
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  changeSelectEstadoAcreditacion(mode:'select' | 'unselect', data: EstadosAcreditacion){
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.formPrograma.setSelectEstadoAcreditacion(data);
      break;
      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.formPrograma.unsetSelectEstadoAcreditacion(data);
      break;
    }
  }

  resetSelected(){
    if (this.from !== 'mantenedor') {
      this.isAnySelected = false;
      this.formPrograma.unsetSelectEstadoAcreditacion();
    }
  }

  refresh(){
    this.resetSelected();
    this.getData(true);
  }

}
