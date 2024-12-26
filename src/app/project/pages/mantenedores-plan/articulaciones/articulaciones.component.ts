import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';

@Component({
  selector: 'app-articulaciones',
  templateUrl: './articulaciones.component.html',
  styles: [
  ]
})
export class ArticulacionesComponent implements OnInit, OnDestroy  {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: ArticulacionesMainService
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
