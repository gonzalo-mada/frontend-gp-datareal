import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';

@Component({
  selector: 'app-suspension',
  templateUrl: './suspension.component.html',
  styles: []
})
export class SuspensionComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: TiposSuspensionesMainService ,
  ){}

  ngOnInit(): void {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }

}
