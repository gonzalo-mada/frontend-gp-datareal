import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
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
  @Input() form!: 'programa' | 'planDeEstudio' ;
  @Input() mode: string = '';
  @Input() from: string = '';


  searchValue: string | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    private formPrograma: FormProgramaService,
    private formPlanDeEstudio: FormPlanDeEstudioService,
    public main: ReglamentosMainService, 
    public table: TableReglamentosService,
    private tableCrudService: TableCrudService

  ){}


  async ngOnInit() {
    this.getReglamentos(true);
    this.subscription.add(this.tableReglamentosService.refreshTableReglamento$.subscribe( () => this.getReglamentos(false) ));
  }

  ngOnDestroy(): void {
    this.tableReglamentosService.resetSelectedRows();
  }

  async getReglamentos(showCountTableValues: boolean){
    await this.reglamentosMainService.getReglamentos(showCountTableValues);
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.tableReglamentosService.resetSelectedRows();
  }
  
  edit(data: Reglamento){
    this.reglamentosMainService.setModeCrud('edit',data);
  }
 
  show(data: Reglamento){
    this.reglamentosMainService.setModeCrud('show', data);
  }
 
  delete(data: Reglamento){
    this.reglamentosMainService.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.tableReglamentosService.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.reglamentosMainService.countTableValues();
  }

changeSelectSuspension(mode:'select' | 'unselect', data: Reglamento){
    if (this.form === 'programa') {
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
    if (this.form === 'planDeEstudio') {
      switch (mode) {
        case 'select':
          this.isAnySelected = true
          data.isSelected = true;
          this.formPlanDeEstudio.setSelectReglamento(data);
        break;
        case 'unselect':
          this.isAnySelected = false
          data.isSelected = false;
          this.formPlanDeEstudio.unsetSelectReglamento(data);
        break;
      }
    }
  }

  resetSelected(){
    if (this.from !== 'mantenedor' && this.form === 'programa') {
      this.isAnySelected = false;
      this.formPrograma.unsetSelectReglamento();
    }

    if (this.from !== 'mantenedor' && this.form === 'planDeEstudio') {
      this.isAnySelected = false;
      this.formPlanDeEstudio.unsetSelectReglamento();
    }
  }

  refresh(){
    this.resetSelected();
    this.getReglamentos(true);
  }


}