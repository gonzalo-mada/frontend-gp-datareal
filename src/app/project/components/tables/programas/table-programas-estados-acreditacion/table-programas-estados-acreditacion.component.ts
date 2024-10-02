import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { EstadosAcreditacion } from 'src/app/project/models/EstadosAcreditacion';
import { Context } from 'src/app/project/models/shared/Context';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { EstadosAcreditacionService } from 'src/app/project/services/estados-acreditacion.service';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-table-programas-estados-acreditacion',
  templateUrl: './table-programas-estados-acreditacion.component.html',
  styles: [
  ]
})

export class TableProgramasEstadosAcreditacionComponent implements OnInit, OnChanges {

  constructor(public configModeService: ConfigModeService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private estadosAcreditacionService: EstadosAcreditacionService,
              private programasService: ProgramasService, 
              private uploaderFilesService: UploaderFilesService,
  ){}
  
  @Input() data: any[] = [];
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = ''
  expandedRows = {};

  ngOnInit(): void {
    this.uploaderFilesService.setContext('mantenedores','estado-acreditacion');
    this.cols = [
      { field: 'Cod_acreditacion', header: 'ID' },
      { field: 'Acreditado', header: 'Acreditado' },
      { field: 'Certificado', header: 'Certificado' },
      { field: 'tiempo.Fecha_inicio', header: 'Fechas acreditación' },
      { field: 'tiempo.Cantidad_anios', header: 'Años acreditado' },
      { field: 'Nombre_ag_acredit', header: 'Nombre agencia' },
      { field: 'Nombre_ag_certif', header: 'Nombre agencia' },
      { field: 'Evaluacion_interna', header: 'Evaluación interna' },
      { field: 'Fecha_informe', header: 'Fecha informe' },
      // { field: 'tiempo.Fecha_termino', header: 'Fecha_termino' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 
      'Acreditado' , 
      'Certificado' , 
      'Nombre_ag_acredit' , 
      'Nombre_ag_certif' , 
      'Evaluacion_interna' , 
      'Fecha_informe' , 
      'tiempo.Fecha_inicio' ,
      'tiempo.Fecha_termino' ,
      'tiempo.Cantidad_anios' 
    ]
    this.dataKeyTable = 'Cod_acreditacion';

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
    this.programasService.emitButtonRefreshTableEA();
  }

  clear(table: Table){
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }

  showColumn(field: string): boolean {
    if ( this.configModeService.config().isPostgrado){
      return field === 'Acreditado' || field === 'Nombre_ag_acredit' || !['Certificado', 'Nombre_ag_certif'].includes(field);
    }else{
      return field === 'Certificado' || field === 'Nombre_ag_certif' || !['Acreditado', 'Nombre_ag_acredit'].includes(field);
    }
  }

  onClickSelectEstadoAcreditacion(data: EstadosAcreditacion){
    this.programasService.setSelectEstadoAcreditacion(data);
  }

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      const files = await this.estadosAcreditacionService.getDocumentosWithBinary({Cod_acreditacion: event.data.Cod_acreditacion});
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
