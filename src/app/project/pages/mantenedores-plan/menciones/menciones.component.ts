import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';

@Component({
  selector: 'app-menciones',
  templateUrl: './menciones.component.html',
  styles: [
  ]
})
export class MencionesComponent implements OnInit, OnDestroy{

  constructor(
      private menuButtonsTableService: MenuButtonsTableService,
      public mencionesMainService: MencionesMainService,
    ){}

  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.mencionesMainService.setModeCrud('create') 
      : this.mencionesMainService.setModeCrud('delete-selected')
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mencionesMainService.reset();
  }

  submit() {
    this.mencionesMainService.modeForm === 'create' 
    ? this.mencionesMainService.setModeCrud('insert')
    : this.mencionesMainService.setModeCrud('update')
  }


}
