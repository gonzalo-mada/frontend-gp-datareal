import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';

@Component({
  selector: 'app-table-programas-docs-maestro',
  templateUrl: './table-programas-docs-maestro.component.html',
  styles: [
  ]
})
export class TableProgramasDocsMaestroComponent implements OnInit, OnDestroy {
  constructor(
    private tableCrudService: TableCrudService,
    private verEditarProgramaMainService: VerEditarProgramaMainService
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

  async onRowExpand() {
    this.verEditarProgramaMainService.setModeCrud('rowExpandClick',null,'maestro');
  }

  onRowCollapse(event: any){
    this.resetExpandedRows();
  }
}
