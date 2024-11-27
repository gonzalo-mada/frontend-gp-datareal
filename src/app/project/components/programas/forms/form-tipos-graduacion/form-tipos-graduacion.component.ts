import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormTiposGraduacionesService } from 'src/app/project/services/programas/tipos-graduaciones/form.service';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';

@Component({
  selector: 'app-form-tipos-graduacion',
  templateUrl: './form-tipos-graduacion.component.html',
  styles: [
  ]
})
export class FormTiposGraduacionComponent implements OnInit, OnDestroy  {
  
  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormTiposGraduacionesService,
    public main: TiposGraduacionesMainService
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
