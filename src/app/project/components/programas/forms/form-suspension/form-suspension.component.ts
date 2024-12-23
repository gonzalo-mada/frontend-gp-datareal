import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormTiposSuspensionesService } from 'src/app/project/services/programas/tipos-suspensiones/form.service';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';

@Component({
  selector: 'app-form-suspension',
  templateUrl: './form-suspension.component.html',
  styles: []
})
export class FormSuspensionComponent implements OnInit, OnDestroy{

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormTiposSuspensionesService,
    public main: TiposSuspensionesMainService
  ){}

  ngOnInit(): void {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

}
