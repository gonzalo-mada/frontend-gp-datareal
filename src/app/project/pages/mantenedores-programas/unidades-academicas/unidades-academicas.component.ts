import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { FormUnidadesAcadService } from 'src/app/project/services/programas/unidades-academicas/form.service';
import { UnidadesAcadMainService } from 'src/app/project/services/programas/unidades-academicas/main.service';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Component({
  selector: 'app-unidades-academicas',
  templateUrl: './unidades-academicas.component.html',
  styles: []
})
export class UnidadesAcademicasComponent implements OnInit, OnDestroy {

  constructor(
    public form: FormUnidadesAcadService,
    public main: UnidadesAcadMainService,
    private menuButtonsTableService: MenuButtonsTableService,
  ){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
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
