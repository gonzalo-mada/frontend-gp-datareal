import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Programa } from 'src/app/project/models/programas/Programa';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';
import { TableReglamentosService } from 'src/app/project/services/programas/reglamentos/table.service';

@Component({
  selector: 'app-table-programas-reglamentos',
  templateUrl: './table-programas-reglamentos.component.html',
  styles: [
  ]
})
export class TableProgramasReglamentosComponent implements OnInit, OnDestroy {
  
  @Input() programa: Programa = {};
  @Input() mode: string = '';
  @Input() isAnySelected: boolean = false;
  searchValue: string | undefined;
  expandedRows = {};
  reglamentos: Reglamento[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    public reglamentosMainService: ReglamentosMainService,
    public form: FormProgramaService,
    public table: TableReglamentosService,
    private tableCrudService: TableCrudService,
  ){}




  async ngOnInit() {
    await this.getReglamentos(false);
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => this.resetExpandedRows() ));
    this.subscription.add(this.table.refreshTableReglamento$.subscribe( () => this.getReglamentos(false) ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async getReglamentos(showCountTableValues: boolean){
    this.reglamentos = await this.reglamentosMainService.getReglamentos(showCountTableValues);
    if (this.programa.Cod_Reglamento) {
      if (this.mode === 'show' ) {
        this.reglamentos = this.reglamentos.filter( r => r.Cod_reglamento === this.programa.Cod_Reglamento)
      }else{
        this.reglamentos.map( reglamento => {
          if (reglamento.Cod_reglamento === this.programa.Cod_Reglamento) {
            reglamento.isSelected = true 
            this.form.stateFormUpdate = 'VALID';
          }else{
            reglamento.isSelected = false
          }
        });
      }
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.resetExpandedRows();
  }

  clear(table: Table){
    this.expandedRows = {}    
    this.searchValue = ''
    table.reset();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  changeSelectSuspension(mode:'select' | 'unselect', data: Reglamento){
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.form.setSelectReglamento(data);
      break;
      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.form.unsetSelectReglamento(data);
      break;
    }
  }

  onRowExpand(event: TableRowExpandEvent) {
    this.reglamentosMainService.setModeCrud('rowExpandClick',event.data)
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

  edit(data: Reglamento){
    this.reglamentosMainService.setModeCrud('edit',data);
  }

}
