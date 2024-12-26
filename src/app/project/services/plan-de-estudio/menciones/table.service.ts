import { Injectable } from '@angular/core';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { TableCrudService } from '../../components/table-crud.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableMencionesService {

  private refreshTablesMenciones = new Subject<void>();
  refreshTableMenciones$ = this.refreshTablesMenciones.asObservable();
  leyendas: any[] = [
      {icon: 'pi pi-chevron-right' , leyenda: 'Permite ver documentos adjuntos'},
      {icon: 'pi pi-check' , leyenda: 'Permite seleccionar mencion'},
      {icon: 'pi pi-minus' , leyenda: 'Permite deseleccionar mencion'},
      {icon: 'pi pi-pencil' , leyenda: 'Permite editar mencion'}
  ];
  cols : any[] = [
      { field: 'Nombre_mencion', header: 'Nombre' },
      { field: 'Descripcion_mencion', header: 'Título' },
      { field: 'Mencion_rexe', header: 'N° Rexe' },
      { field: 'Vigencia', header: 'Vigencia' },
      { field: 'Acciones', header: 'Acciones' },
  ];
  globalFiltros : any[] = [ 'Nombre_mencion' , ];
  dataKeyTable : string = 'Cod_mencion';
  selectedRows: Mencion[] = [];

  constructor(private tableCrudService: TableCrudService){}

  setSelectedRows(){
      this.tableCrudService.setSelectedRows(this.selectedRows);
  }

  resetSelectedRows(){
      this.selectedRows = [];
      this.setSelectedRows();
  }

  emitRefreshTablesMenciones(){
      this.refreshTablesMenciones.next();
  }

  emitResetExpandedRows(){
      this.tableCrudService.emitResetExpandedRowsTable();
  }
}