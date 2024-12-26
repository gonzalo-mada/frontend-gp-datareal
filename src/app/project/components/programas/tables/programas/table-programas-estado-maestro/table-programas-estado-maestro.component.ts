import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';

@Component({
  selector: 'app-table-programas-estado-maestro',
  templateUrl: './table-programas-estado-maestro.component.html',
  styles: [
  ]
})
export class TableProgramasEstadoMaestroComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private tableCrudService: TableCrudService,
    private verEditarProgramaMainService: VerEditarProgramaMainService
  ){}


  @Input() data: any[] = [];
  @Input() mode: string = '';

  dataKeyTable: string = ''
  expandedRows = {};
  cols: any[] = [];
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.dataKeyTable = 'Cod_EstadoMaestro';
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => {this.resetExpandedRows()} ));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['data'] && changes['data'].currentValue) {
      if (this.data[0].Cod_EstadoMaestro === 2) {
        this.cols = [
          {header: 'Estado'},
          {header: 'Tipo de suspensión'}
        ];
      }else{
        this.cols = [
          {header: 'Estado'}
        ];
      }
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  async onRowExpand() {
    this.verEditarProgramaMainService.setModeCrud('rowExpandClick',null,'estado_maestro');
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

}
