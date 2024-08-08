import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Campus } from 'src/app/project/models/Campus';

@Component({
  selector: 'app-table-campus',
  templateUrl: './table-campus.component.html',
  styles: [
  ]
})
export class TableCampusComponent implements OnChanges, OnDestroy {
  
  

  @Input() data : any;
  @Input() cols : any;
  @Input() globalFiltros : any;
  @Input() dataKeyTable : any;
  @Input() resetSelectedRowsEmitter: EventEmitter<void> = new EventEmitter();


  @Output() refreshTable = new EventEmitter<any>();
  @Output() actionMode = new EventEmitter<any>();
  @Output() actionSelectRow = new EventEmitter<any>();

  mode : string = '';
  selectedCampus: Campus[] = [] ;
  private subscription!: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.resetSelectedRowsEmitter.subscribe(() => {
      // console.log("hola fui emitido");
      this.resetSelectedRows();
    });

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  resetSelectedRows(){
    this.selectedCampus = []
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refresh(){
    this.refreshTable.emit();
  }

  edit(campus: Campus){
    this.mode = 'edit';
    this.actionMode.emit({data: campus , mode: this.mode})
  }

  show(campus: Campus){
    this.mode = 'show';
    this.actionMode.emit({data: campus , mode: this.mode})
  }

  changeState(campus: Campus , estado_campus: boolean){
    if (estado_campus === true) {
      //modo eliminar
      this.mode = 'delete';
      this.actionMode.emit({data: campus , mode: this.mode})
    }else{
      //modo activar
      this.mode = 'activate';
      this.actionMode.emit({data: campus , mode: this.mode})
    }
  }

  selectionChange(event: any){   
    this.actionSelectRow.emit(this.selectedCampus);
  }



}
