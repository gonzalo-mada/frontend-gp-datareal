import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UnidadAcademica } from 'src/app/project/models/UnidadAcademica';
import { ActionsCrudService } from 'src/app/project/services/actions-crud.service';

@Component({
  selector: 'app-table-unidades-academicas',
  templateUrl: './table-unidades-academicas.component.html',
  styles: [
  ]
})
export class TableUnidadesAcademicasComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() cols : any;
  @Input() globalFiltros : any;
  @Input() dataKeyTable : any;
 
  mode : string = '';
  selectedRow: UnidadAcademica[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];
 
  private subscription: Subscription = new Subscription();
 
  constructor(private actionsCrudService: ActionsCrudService){}
 
  ngOnInit(): void {
    this.subscription = this.actionsCrudService.actionResetSelectedRows$.subscribe( actionTriggered => { actionTriggered && this.resetSelectedRows();})
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
    this.actionsCrudService.triggerRefreshTableAction();
  }
 
  edit(data: UnidadAcademica){
    this.mode = 'edit';
    this.actionsCrudService.triggerModeAction(data,this.mode);
  }
 
  show(data: UnidadAcademica){
    this.mode = 'show';
    this.actionsCrudService.triggerModeAction(data,this.mode);
  }
 
  delete(data: UnidadAcademica){
    this.mode = 'delete';
    this.actionsCrudService.triggerModeAction(data,this.mode);
  }
 
  selectionChange(){  
    this.actionsCrudService.setSelectedRows(this.selectedRow)
  }
 
  resetSelectedRows(){    
    this.selectedRow = [];
    this.actionsCrudService.setSelectedRows(this.selectedRow)
  }
 
  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }
}
