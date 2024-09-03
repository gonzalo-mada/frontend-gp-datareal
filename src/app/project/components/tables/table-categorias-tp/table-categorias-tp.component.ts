import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { CategoriaTp } from 'src/app/project/models/CategoriaTp';
import { ActionsCrudService } from 'src/app/project/services/actions-crud.service';

@Component({
  selector: 'app-table-categorias-tp',
  templateUrl: './table-categorias-tp.component.html',
  styles: [
  ]
})
export class TableCategoriasTpComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any[] = [];
  @Input() cols : any;
  @Input() globalFiltros : any;
  @Input() dataKeyTable : any;

  mode : string = '';
  selectedRow: CategoriaTp[] = [] ;
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
  
  edit(data: CategoriaTp){
    this.mode = 'edit';
    this.actionsCrudService.triggerModeAction(data,this.mode);
  }

  show(data: CategoriaTp){
    this.mode = 'show';
    this.actionsCrudService.triggerModeAction(data,this.mode);
  }

  delete(data: CategoriaTp){
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
