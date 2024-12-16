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
  selector: 'app-table-reglamentos',
  templateUrl: './table-reglamentos.component.html',
  styles: [
  ]
})

export class TableReglamentosComponent implements OnInit, OnDestroy {

  @Input() programa: Programa = {};
  @Input() mode: string = '';
  @Input() from: string = '';

  searchValue: string | undefined;
  expandedRows = {};
  reglamentos: Reglamento[] = [];
  isAnySelected: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
    public formPrograma: FormProgramaService,
    public main: ReglamentosMainService, 
    public table: TableReglamentosService,
    private tableCrudService: TableCrudService
  ){}


  async ngOnInit() {
    this.from === 'mantenedor' ? this.getReglamentos(true) : this.getReglamentos(false)
    this.subscription.add(this.tableCrudService.resetExpandedRowsTableSubject$.subscribe( () => this.resetExpandedRows() ));
    this.subscription.add(this.table.refreshTableReglamento$.subscribe( () => this.getReglamentos(false) ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.table.resetSelectedRows();
  }

  async getReglamentos(showCountTableValues: boolean){
    this.reglamentos = await this.main.getReglamentos(showCountTableValues);
    if (this.programa.Cod_Reglamento) {
      this.reglamentos.map( reglamento => {
        if (reglamento.Cod_reglamento === this.programa.Cod_Reglamento) {
          reglamento.isSelected = true 
          this.formPrograma.stateFormUpdate = 'VALID';
          this.isAnySelected = true;
        }else{
          reglamento.isSelected = false
        }
      });
    }
    
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }
  
  edit(data: Reglamento){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: Reglamento){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: Reglamento){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.expandedRows = {}; 
    this.searchValue = '';
    table.reset();
    this.main.countTableValues();
  }

  onRowExpand(event: TableRowExpandEvent) {
    this.main.setModeCrud('rowExpandClick',event.data)
  }

  onRowCollapse(){
    this.resetExpandedRows();
  }

  resetExpandedRows(){
    this.expandedRows = {} 
  }

  changeSelectSuspension(mode:'select' | 'unselect', data: Reglamento){
    switch (mode) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.formPrograma.setSelectReglamento(data);
      break;
      case 'unselect':
        this.isAnySelected = false
        data.isSelected = false;
        this.formPrograma.unsetSelectReglamento(data);
      break;
    }
  }

  resetSelected(){
    if (this.from !== 'mantenedor') {
      this.isAnySelected = false;
      this.formPrograma.unsetSelectReglamento();
    }
  }

  refresh(){
    this.resetSelected();
    this.getReglamentos(true);
  }

}