import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';
import { TableMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/table.service';

@Component({
  selector: 'app-table-menciones',
  templateUrl: './table-menciones.component.html',
  styles: [
  ]
})

export class TableMencionesComponent implements OnInit, OnDestroy{
  
  searchValue: string | undefined;
  private subscription: Subscription = new Subscription();

  constructor(      
    public mencionesMainService: MencionesMainService,
    public tableMencionesService: TableMencionesService
  ){}
  
  async ngOnInit() {
    this.getMenciones(true);
    this.subscription.add(this.tableMencionesService.refreshTableMenciones$.subscribe( () => this.getMenciones(false) ));
  }

  ngOnDestroy(): void {
    this.tableMencionesService.resetSelectedRows();

  }

  async getMenciones(showCountTableValues: boolean){
    await this.mencionesMainService.getMenciones(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
      this.tableMencionesService.resetSelectedRows();
    }
    
    edit(data: Mencion){
      this.mencionesMainService.setModeCrud('edit',data);
    }
   
    show(data: Mencion){
      this.mencionesMainService.setModeCrud('show', data);
    }
   
    delete(data: Mencion){
      this.mencionesMainService.setModeCrud('delete', data);
    }
     
    clear(table: Table){
      this.tableMencionesService.resetSelectedRows();
      this.searchValue = ''
      table.reset();
      this.mencionesMainService.countTableValues();
    }
}
