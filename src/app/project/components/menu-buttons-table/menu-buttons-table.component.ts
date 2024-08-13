import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampusService } from '../../services/campus.service';

@Component({
  selector: 'app-menu-buttons-table',
  templateUrl: './menu-buttons-table.component.html',
  styles: [
  ]
})
export class MenuButtonsTableComponent implements OnInit, OnDestroy {
 
  disabled : boolean = true;

  private subscription!: Subscription;

  constructor(private campusService: CampusService){}
  
  ngOnInit(): void {
    this.subscription = this.campusService.selectedRows$.subscribe( selectedRows => {
      selectedRows.length === 0 ? this.disabled = true : this.disabled = false;
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  openNew(){
    this.campusService.triggerNewRegisterAction();
  }

  deleteSelected(){
    this.campusService.triggerDeleteAction();
  }

  
}
