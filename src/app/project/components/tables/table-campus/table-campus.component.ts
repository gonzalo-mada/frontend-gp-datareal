import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Campus } from 'src/app/project/models/Campus';
import { CampusService } from 'src/app/project/services/campus.service';

@Component({
  selector: 'app-table-campus',
  templateUrl: './table-campus.component.html',
  styles: [
  ]
})
export class TableCampusComponent implements OnInit ,OnChanges, OnDestroy {
  
  @Input() data : any;
  @Input() cols : any;
  @Input() globalFiltros : any;
  @Input() dataKeyTable : any;

  mode : string = '';
  selectedCampus: Campus[] = [] ;
  searchValue: string | undefined;
  originalData: any[] = [];

  private subscription: Subscription = new Subscription();

  constructor(private campusService: CampusService){}

  ngOnInit(): void {
    this.subscription = this.campusService.actionResetSelectedRows$.subscribe( actionTriggered => { actionTriggered && this.resetSelectedRows();})
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
    this.campusService.triggerRefreshTableAction();
  }

  edit(campus: Campus){
    this.mode = 'edit';
    this.campusService.triggerModeAction(campus,this.mode);
  }

  show(campus: Campus){
    this.mode = 'show';
    this.campusService.triggerModeAction(campus,this.mode);
  }

  delete(campus: Campus){
    this.mode = 'delete';
    this.campusService.triggerModeAction(campus,this.mode);
  }

  changeState(campus: Campus , estado_campus: boolean){
    this.mode = 'changeState';
    this.campusService.triggerModeAction(campus,this.mode);
  }

  selectionChange(){   
    this.campusService.setSelectedRows(this.selectedCampus)
  }

  resetSelectedRows(){    
    this.selectedCampus = [];
    this.campusService.setSelectedRows(this.selectedCampus)
  }

  clear(table: Table){
    this.resetSelectedRows();
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }




}
