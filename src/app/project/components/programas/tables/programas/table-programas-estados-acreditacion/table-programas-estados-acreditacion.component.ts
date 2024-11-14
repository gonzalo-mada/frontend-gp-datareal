import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Context } from 'src/app/project/models/shared/Context';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { EstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-table-programas-estados-acreditacion',
  templateUrl: './table-programas-estados-acreditacion.component.html',
  styles: [
  ]
})

export class TableProgramasEstadosAcreditacionComponent implements OnInit, OnChanges, OnDestroy {

  constructor(public configModeService: ConfigModeService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private estadosAcreditacionService: EstadosAcreditacionService,
              private messageService: MessageService,
              private programasService: ProgramasService, 
              private tableCrudService: TableCrudService,
              private uploaderFilesService: UploaderFilesService,
  ){}

  
  @Input() data: any[] = [];
  @Input() mode: string = '';
  @Input() isAnySelected: boolean = false;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = ''
  expandedRows = {};
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.cols = [
      { field: 'Sigla', header: 'Identificador', width: '350px', useMinWidth: true },
      { field: 'Acreditado', header: 'Estado', width: '180px', useMinWidth: true },
      { field: 'Certificado', header: 'Estado', width: 'auto', useMinWidth: false },
      // { field: 'Nombre_ag_acredit', header: 'Nombre agencia', width: 'auto', useMinWidth: false },
      // { field: 'Nombre_ag_certif', header: 'Nombre agencia', width: 'auto', useMinWidth: false },
      { field: 'Evaluacion_interna', header: 'Evaluación interna', width: 'auto', useMinWidth: false },
      { field: 'Fecha_informe', header: 'Fecha informe', width: 'auto', useMinWidth: false },
      // { field: 'tiempo.Fecha_termino', header: 'Fecha_termino' },
      { field: 'accion', header: 'Acciones', width: 'auto', useMinWidth: false }
    ];

    this.globalFiltros = [
      'Sigla', 
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

    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => {this.resetExpandedRows()} ));

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.originalData = [...this.data];
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    
  }

  refresh(){
    this.programasService.emitButtonRefreshTableEA();
  }

  clear(table: Table){
    this.expandedRows = {}; 
    this.searchValue = '';
    this.data = [...this.originalData];
    table.reset();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  showColumn(field: string): boolean {
    if ( this.configModeService.config().isPostgrado){
      return field === 'Acreditado' || field === 'Nombre_ag_acredit' || !['Certificado', 'Nombre_ag_certif'].includes(field);
    }else{
      return field === 'Certificado' || field === 'Nombre_ag_certif' || !['Acreditado', 'Nombre_ag_acredit'].includes(field);
    }
  }

  changeSelectEstadoAcreditacion(mode:'select' | 'unselect', data: EstadosAcreditacion){
    this.messageService.clear();
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.programasService.setSelectEstadoAcreditacion(data);
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: `Estado acreditación: "${data.Sigla}" seleccionado`,
        });
      break;

      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.programasService.unsetSelectEstadoAcreditacion();
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: `Estado acreditación: "${data.Sigla}" deseleccionado`,
        });
      break;
    
    }
  }

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      this.uploaderFilesService.setLoading(true,true);
      this.uploaderFilesService.setContext('show','mantenedores','estado-acreditacion');
      const files = await this.estadosAcreditacionService.getDocumentosWithBinary({Cod_acreditacion: event.data.Cod_acreditacion});
      this.uploaderFilesService.setFiles(files);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      }
    );
    }finally{
      this.uploaderFilesService.setLoading(false);
    }
  }

  onRowCollapse(event: any){
    this.resetExpandedRows();
  }

  getColStyle(col: any) {
    if (col.useMinWidth) {
      return { 'min-width': col.width };
    } else {
      return { 'width': col.width };
    }
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
