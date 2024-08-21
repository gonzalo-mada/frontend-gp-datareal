import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Campus } from 'src/app/project/models/Campus';
import { ActionsCrudService } from 'src/app/project/services/actions-crud.service';

@Component({
  selector: 'app-table-campus',
  templateUrl: './table-campus.component.html',
  styles: [
  ]
})
export class TableCampusComponent implements OnInit ,OnChanges, OnDestroy {
  
  @Input() data: any[] = [];
  @Input() cols : any;
  @Input() globalFiltros : any;
  @Input() dataKeyTable : any;

  mode : string = '';
  selectedCampus: Campus[] = [] ;
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

  edit(campus: Campus){
    this.mode = 'edit';
    this.actionsCrudService.triggerModeAction(campus,this.mode);
  }

  show(campus: Campus){
    this.mode = 'show';
    this.actionsCrudService.triggerModeAction(campus,this.mode);
  }

  delete(campus: Campus){
    this.mode = 'delete';
    this.actionsCrudService.triggerModeAction(campus,this.mode);
  }

  changeState(campus: Campus , estado_campus: boolean){
    this.mode = 'changeState';
    this.actionsCrudService.triggerModeAction(campus,this.mode);
  }

  selectionChange(){   
    this.actionsCrudService.setSelectedRows(this.selectedCampus)
  }

  resetSelectedRows(){    
    this.selectedCampus = [];
    this.actionsCrudService.setSelectedRows(this.selectedCampus)
  }

  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }




}
