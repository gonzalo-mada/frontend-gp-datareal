import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormModalidadService } from 'src/app/project/services/plan-de-estudio/modalidades/form.service';
import { ModalidadMainService } from 'src/app/project/services/plan-de-estudio/modalidades/main.service';

@Component({
  selector: 'app-form-modalidades',
  templateUrl: './form-modalidades.component.html',
  styles: []
})
export class FormModalidadesComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormModalidadService,
    public main: ModalidadMainService
  ) {}

  async ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { 
      this.form.stateForm = status as StateValidatorForm;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }
}
