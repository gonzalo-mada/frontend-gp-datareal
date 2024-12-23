import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { PlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/main.service';
import { TablePlanesDeEstudiosService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/table.service';

@Component({
  selector: 'app-table-plan-de-estudio',
  templateUrl: './table-plan-de-estudio.component.html',
  styles: [
  ]
})
export class TablePlanDeEstudioComponent implements OnInit, OnDestroy {

  searchValue: string | undefined;

  constructor( 
    public main: PlanDeEstudioMainService,
    public table: TablePlanesDeEstudiosService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getPlanesDeEstudios(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: PlanDeEstudio){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: PlanDeEstudio){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: PlanDeEstudio){
    this.main.setModeCrud('delete', data);
  }

  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

  customSortAccreditation(event:any) {

    switch (event.field) {

      case 'Acreditacion':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Acreditacion ? data1.Acreditacion.Acreditado : '';
          const value2 = data2.Acreditacion ? data2.Acreditacion.Acreditado : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break;

      case 'Tipo_programa':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.Tipo_programa ? data1.Tipo_programa.Descripcion_tp : '';
          const value2 = data2.Tipo_programa ? data2.Tipo_programa.Descripcion_tp : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break
    
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
        })
      break;
    }


  }

}
