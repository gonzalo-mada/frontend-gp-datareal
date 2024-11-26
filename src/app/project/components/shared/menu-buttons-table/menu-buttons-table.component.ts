import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from '../../../services/components/menu-buttons-table.service';
import { TableCrudService } from '../../../services/components/table-crud.service';

@Component({
  selector: 'app-menu-buttons-table',
  templateUrl: './menu-buttons-table.component.html',
  styles: [
  ]
})
export class MenuButtonsTableComponent implements OnInit, OnDestroy {
 
  constructor(
    public menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService
  ){}

  disabled : boolean = true;

  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.tableCrudService.selectedRows$.subscribe( selectedRows => { selectedRows.length === 0 ? this.disabled = true : this.disabled = false }));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  
}
