import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormCertifIntermediaService } from 'src/app/project/services/programas/certificaciones-intermedias/form.service';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';

@Component({
  selector: 'app-form-certificaciones-intermedias',
  templateUrl: './form-certificaciones-intermedias.component.html',
  styles: [
  ]
})
export class FormCertificacionesIntermediasComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormCertifIntermediaService,
    public main: CertifIntermediaMainService
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
