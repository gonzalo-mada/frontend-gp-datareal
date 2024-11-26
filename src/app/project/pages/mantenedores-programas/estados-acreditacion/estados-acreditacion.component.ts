import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { EstadosAcreditacionMainService } from 'src/app/project/services/programas/estados-acreditacion/main.service';

@Component({
  selector: 'app-estado-acreditacion',
  templateUrl: './estados-acreditacion.component.html',
  styles: []
})
export class EstadosAcreditacionComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public main: EstadosAcreditacionMainService,
    private menuButtonsTableService: MenuButtonsTableService,
  ){}

  async ngOnInit() {
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

  submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }

}
