import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-table-programas-reglamentos',
  templateUrl: './table-programas-reglamentos.component.html',
  styles: [
  ]
})
export class TableProgramasReglamentosComponent implements OnInit, OnChanges {
  constructor(private programasService: ProgramasService){}
  @Input() data: any[] = [];
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = ''

  ngOnInit(): void {
    this.cols = [
      { field: 'Descripcion_regla', header: 'Nombre' },
      { field: 'vigencia', header: 'Vigencia' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_regla' ];
    this.dataKeyTable = 'Cod_reglamento';
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
    this.programasService.emitButtonRefreshTableReg();
  }

  clear(table: Table){
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }

  onClickSelectSuspension(data: Reglamento){
    this.programasService.setSelectReglamento(data);
  }

}
