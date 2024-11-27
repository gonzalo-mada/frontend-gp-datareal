import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';

@Component({
  selector: 'app-reglamentos',
  templateUrl: './reglamentos.component.html',
  styles: [],
})

export class ReglamentosComponent implements OnInit, OnDestroy {

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public reglamentosMainService: ReglamentosMainService,
  ){}

  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.reglamentosMainService.setModeCrud('create') 
      : this.reglamentosMainService.setModeCrud('delete-selected')
    }));
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reglamentosMainService.reset();
  }

  submit() {
    this.reglamentosMainService.modeForm === 'create' 
    ? this.reglamentosMainService.setModeCrud('insert')
    : this.reglamentosMainService.setModeCrud('update')
  }
  
}