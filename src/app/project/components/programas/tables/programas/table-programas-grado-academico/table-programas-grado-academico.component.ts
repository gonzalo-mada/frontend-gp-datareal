import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';

@Component({
  selector: 'app-table-programas-grado-academico',
  templateUrl: './table-programas-grado-academico.component.html',
  styles: [
  ]
})
export class TableProgramasGradoAcademicoComponent implements OnInit, OnDestroy {

  constructor(
    private tableCrudService: TableCrudService,
    private verEditarProgramaMainService: VerEditarProgramaMainService
  ){}

  @Input() data: any[] = [];
  @Input() mode: string = '';

  dataKeyTable: string = '';
  expandedRows = {};
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.dataKeyTable = 'Grado académico';
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
    this.verEditarProgramaMainService.setModeCrud('rowExpandClick',null,'grado_academico');
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

  
}
