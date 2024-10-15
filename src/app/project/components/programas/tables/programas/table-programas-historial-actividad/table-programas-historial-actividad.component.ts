import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-table-programas-historial-actividad',
  templateUrl: './table-programas-historial-actividad.component.html',
  styles: [
  ]
})
export class TableProgramasHistorialActividadComponent implements OnInit, OnDestroy {
  constructor(
    private errorTemplateHandler: ErrorTemplateHandler,
    private programasService: ProgramasService, 
    private tableCrudService: TableCrudService,
  ){}

  @Input() data: any[] = [];
  @Input() mode: string = '';

  dataKeyTable: string = ''
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.dataKeyTable = 'Cod_Programa';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
