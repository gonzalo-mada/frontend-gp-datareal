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
      switch (action) {
        case 'agregar': this.main.setModeCrud('create');break;
        case 'eliminar': this.main.setModeCrud('delete-selected');break;
        case 'historial': this.main.setModeCrud('historial');break;
      } 
    }));
    this.main.setOrigen('estados_acred');
    this.main.setNeedUpdateHistorial(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
    this.main.setNeedUpdateHistorial(false);
  }

  submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }

}
