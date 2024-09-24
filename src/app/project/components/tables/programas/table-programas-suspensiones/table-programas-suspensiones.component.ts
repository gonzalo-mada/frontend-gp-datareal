import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Suspension } from 'src/app/project/models/Suspension';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-table-programas-suspensiones',
  templateUrl: './table-programas-suspensiones.component.html',
  styles: [
  ]
})
export class TableProgramasSuspensionesComponent implements OnInit, OnChanges {
  constructor(private programasService: ProgramasService){}
  @Input() data: any[] = [];
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = ''

  ngOnInit(): void {
    this.cols = [
      { field: 'Nombre', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Nombre' ];
    this.dataKeyTable = 'ID_TipoSuspension';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.originalData = [...this.data];
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refresh(){
    this.programasService.emitButtonRefreshTableSusp();
  }

  clear(table: Table){
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }

  onClickSelectSuspension(data: Suspension){
    this.programasService.setSelectSuspension(data);
  }
  

}
