import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { Context } from 'src/app/project/models/shared/Context';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas.service';
import { ReglamentosService } from 'src/app/project/services/reglamentos.service';

@Component({
  selector: 'app-table-programas-reglamentos',
  templateUrl: './table-programas-reglamentos.component.html',
  styles: [
  ]
})
export class TableProgramasReglamentosComponent implements OnInit, OnChanges {
  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private reglamentosService: ReglamentosService,
    private programasService: ProgramasService,
    private uploaderFilesService: UploaderFilesService
  ){}

  @Input() data: any[] = [];
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';
  expandedRows = {};

  ngOnInit(): void {
    this.uploaderFilesService.setContext('mantenedores','reglamentos');
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

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      const files = await this.reglamentosService.getDocumentosWithBinary(event.data.Cod_reglamento);
      this.uploaderFilesService.setFiles(files);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      }
    );
    }
  }

}
