import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-table-programas-docs-maestro',
  templateUrl: './table-programas-docs-maestro.component.html',
  styles: [
  ]
})
export class TableProgramasDocsMaestroComponent implements OnInit, OnDestroy {
  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private programasService: ProgramasService, 
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService,
  ){}

  dataKeyTable: string = '';
  expandedRows = {};
  private subscription: Subscription = new Subscription();

  @Input() data: any[] = [];
  @Input() mode: string = '';

  ngOnInit(): void {
    this.dataKeyTable = 'Nombre_programa';
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => {this.resetExpandedRows()} ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  async onRowExpand(event: TableRowExpandEvent) {
    try {
      this.uploaderFilesService.setLoading(true,true);
      const cod_programa = this.programasService.fbForm.get('Cod_Programa')!.value
      this.uploaderFilesService.setContext('show','programa','ver-programa','Maestro');
      const files = await this.programasService.getDocumentosWithBinary(parseInt(cod_programa),'maestro');
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
}
