import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';
import { CategoriasTpMainService } from 'src/app/project/services/programas/categorias-tp/main.service';
import { TableCategoriasTpService } from 'src/app/project/services/programas/categorias-tp/table.service';

@Component({
  selector: 'app-table-categorias-tp',
  templateUrl: './table-categorias-tp.component.html',
  styles: [
  ]
})
export class TableCategoriasTpComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;
  originalData: any[] = [];

  constructor( 
    public main: CategoriasTpMainService,
    public table: TableCategoriasTpService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getCategoriasTp(showCountTableValues);
    this.originalData = [...this.main.categoriasTp];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: CategoriaTp){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: CategoriaTp){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: CategoriaTp){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    this.main.categoriasTp = [...this.originalData];
    table.reset();
  }
}
