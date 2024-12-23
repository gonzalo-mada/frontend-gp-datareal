import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { CategoriasTpMainService } from 'src/app/project/services/programas/categorias-tp/main.service';

@Component({
  selector: 'app-categorias-tp',
  templateUrl: './categorias-tp.component.html',
  styles: []
})
export class CategoriasTpComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: CategoriasTpMainService,
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
