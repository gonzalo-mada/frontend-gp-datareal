import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { FormFacultadesService } from 'src/app/project/services/programas/facultad/form.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';


@Component({
  selector: 'app-facultad',
  templateUrl: './facultad.component.html',
  styles: []
})
export class FacultadComponent implements OnInit, OnDestroy {

  constructor(
    public form: FormFacultadesService,
    public main: FacultadesMainService,
    private menuButtonsTableService: MenuButtonsTableService,
  ){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
      switch (action) {
        case 'agregar': this.main.setModeCrud('create');break;
        case 'eliminar': this.main.setModeCrud('delete-selected');break;
        case 'historial': this.main.setModeCrud('historial');break;
      } 
    }));
    this.main.setOrigen('facultad');
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }

  submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }
}
