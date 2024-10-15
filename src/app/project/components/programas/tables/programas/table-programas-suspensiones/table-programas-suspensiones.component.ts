import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Context } from 'src/app/project/models/shared/Context';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';

@Component({
  selector: 'app-table-programas-suspensiones',
  templateUrl: './table-programas-suspensiones.component.html',
  styles: [
  ]
})
export class TableProgramasSuspensionesComponent implements OnInit, OnChanges {
  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private suspensionesService: SuspensionesService,
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
    this.uploaderFilesService.setContext('show','mantenedores','suspension')
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

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      const files = await this.suspensionesService.getDocumentosWithBinary({ID_TipoSuspension: event.data.ID_TipoSuspension});
      this.uploaderFilesService.setFiles(files);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos de tipos de suspensiones',
        message: e.detail.error.message.message
      }
    );
    }
  }
  

}
