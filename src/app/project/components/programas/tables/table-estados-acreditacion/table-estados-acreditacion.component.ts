import { Component,OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { EstadosAcreditacionMainService } from 'src/app/project/services/programas/estados-acreditacion/main.service';
import { TableEstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion/table.service';

@Component({
  selector: 'app-table-estados-acreditacion',
  templateUrl: './table-estados-acreditacion.component.html',
  styles: [
  ]
})
export class TableEstadosAcreditacionComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    public main: EstadosAcreditacionMainService, 
    public table: TableEstadosAcreditacionService
  ){}

  async ngOnInit() {
    this.subscription.add(this.table.refreshTableEA$.subscribe( () => this.getData(false) ));
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getEstadosAcreditacion(showCountTableValues);
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
    this.table.resetSelectedRows();
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

}
