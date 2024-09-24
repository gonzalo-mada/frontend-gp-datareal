import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Mantenedor, MenuButtonsTableService, Mode } from '../../services/components/menu-buttons-table.service';
import { TableCrudService } from '../../services/components/table-crud.service';

@Component({
  selector: 'app-menu-buttons-table',
  templateUrl: './menu-buttons-table.component.html',
  styles: [
  ]
})
export class MenuButtonsTableComponent implements OnInit, OnDestroy {
 
  constructor(private router: Router,
              private menuButtonsTableService: MenuButtonsTableService,
              private tableCrudService: TableCrudService
  ){}

  disabled : boolean = true;
  mantenedor! : Mantenedor;
  mode! : Mode;

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.contextUpdate$.subscribe( context => {
      if (context.mantenedor && context.mode) {
        this.mantenedor = context.mantenedor;
        this.mode = context.mode;
      }
    }))
    this.subscription.add(this.tableCrudService.selectedRows$.subscribe( selectedRows => { selectedRows.length === 0 ? this.disabled = true : this.disabled = false }));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  openNew(){
    if (this.mode === 'page') {
      switch (this.mantenedor) {
        case 'programa':
          this.router.navigate(['/programa/add']);
        break;
      }
    }else{
      this.menuButtonsTableService.emitClickButtonAgregar();
    }
  }

  deleteSelected(){
    this.menuButtonsTableService.emitClickDeleteSelected();
  }

  
}
