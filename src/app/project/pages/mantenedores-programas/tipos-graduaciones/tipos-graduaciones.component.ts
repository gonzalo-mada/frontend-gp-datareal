import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';

@Component({
  selector: 'app-graduaciones',
  templateUrl: './tipos-graduaciones.component.html',
  styles: []
})
export class TiposGraduacionesComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: TiposGraduacionesMainService ,
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
