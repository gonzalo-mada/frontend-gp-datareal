import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { CampusMainService } from 'src/app/project/services/programas/campus/main.service';
import { FormCampusService } from 'src/app/project/services/programas/campus/form.service';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styles: [],
})

export class CampusComponent implements OnInit, OnDestroy {

  constructor(
    public form: FormCampusService,
    public main: CampusMainService,
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
    this.main.setOrigen('campus');
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }

  submit() {
    this.main.modeForm === 'create'     ? this.main.setModeCrud('insert')
    : this.main.setModeCrud('update')
  }

}
