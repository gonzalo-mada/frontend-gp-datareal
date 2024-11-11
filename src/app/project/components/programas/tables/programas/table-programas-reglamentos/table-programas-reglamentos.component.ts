import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { Context } from 'src/app/project/models/shared/Context';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { ReglamentosService } from 'src/app/project/services/programas/reglamentos.service';

@Component({
  selector: 'app-table-programas-reglamentos',
  templateUrl: './table-programas-reglamentos.component.html',
  styles: [
  ]
})
export class TableProgramasReglamentosComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private reglamentosService: ReglamentosService,
    public programasService: ProgramasService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}


  @Input() data: any[] = [];
  @Input() mode: string = '';
  @Input() isAnySelected: boolean = false;
  searchValue: string | undefined;
  originalData: any[] = [];
  cols: any[] = []
  globalFiltros: any[] = []
  dataKeyTable: string = '';
  expandedRows = {};
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.cols = [
      { field: 'Descripcion_regla', header: 'Nombre' },
      { field: 'vigencia', header: 'Vigencia' },
      { field: 'anio', header: 'Año' },
      { field: 'accion', header: 'Acciones' }
    ];
    this.globalFiltros = [ 'Descripcion_regla' , 'anio' ];
    this.dataKeyTable = 'Cod_reglamento';
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
    this.programasService.emitButtonRefreshTableReg();
  }

  clear(table: Table){
    this.expandedRows = {}    
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  changeSelectSuspension(mode:'select' | 'unselect', data: Reglamento){
    this.messageService.clear();
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.programasService.setSelectReglamento(data);
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: `Reglamento: "${data.Descripcion_regla}" seleccionado`,
        });
      break;

      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.programasService.unsetSelectReglamento();
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: `Reglamento: "${data.Descripcion_regla}" deseleccionado`,
        });
      break;

    }


  }

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      this.uploaderFilesService.setLoading(true,true);
      this.uploaderFilesService.setContext('show','mantenedores','reglamentos');
      const files = await this.reglamentosService.getDocumentosWithBinary(event.data.Cod_reglamento);
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

  test(){
    console.log("DATA: ",this.data);
    
  }

}
