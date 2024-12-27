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
  colFrozen: boolean = false;

  constructor( 
    public main: PlanDeEstudioMainService,
    public table: TablePlanesDeEstudiosService
  ){}

  ngOnInit(): void {
    // this.getData(true);
  }

  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    // await this.main.getPlanesDeEstudios(showCountTableValues);
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

      case 'case_rangos':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.tiene_rango_aprob_g ? data1.tiene_rango_aprob_g : '';
          const value2 = data2.tiene_rango_aprob_g ? data2.tiene_rango_aprob_g : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break;

      case 'case_certificacion':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.tiene_certificacion ? data1.tiene_certificacion : '';
          const value2 = data2.tiene_certificacion ? data2.tiene_certificacion : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break;

      case 'case_articulaciones':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.num_articulaciones ? data1.num_articulaciones : '';
          const value2 = data2.num_articulaciones ? data2.num_articulaciones : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break;

      case 'jornada.descripcion_jornada':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.jornada ? data1.jornada.descripcion_jornada : '';
          const value2 = data2.jornada ? data2.jornada.descripcion_jornada : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break

      case 'modalidad.descripcion_modalidad':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.modalidad ? data1.modalidad.descripcion_modalidad : '';
          const value2 = data2.modalidad ? data2.modalidad.descripcion_modalidad : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break

      case 'estado.descripcion_estado':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.estado ? data1.estado.descripcion_estado : '';
          const value2 = data2.estado ? data2.estado.descripcion_estado : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break

      case 'reglamento.descripcion_reglamento':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.reglamento ? data1.reglamento.descripcion_reglamento : '';
          const value2 = data2.reglamento ? data2.reglamento.descripcion_reglamento : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        })
      break

      case 'regimen.descripcion_regimen':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.regimen ? data1.regimen.descripcion_regimen : '';
          const value2 = data2.regimen ? data2.regimen.descripcion_regimen : '';
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
